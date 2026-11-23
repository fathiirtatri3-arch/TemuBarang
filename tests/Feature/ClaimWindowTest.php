<?php

namespace Tests\Feature;

use App\Models\Claim;
use App\Models\Notification;
use App\Models\Region;
use App\Models\Report;
use App\Models\ReportFollowup;
use App\Models\User;
use App\Services\ClaimWindowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Siklus hidup barang temuan: masa klaim 30 hari -> kedaluwarsa ->
 * tindak lanjut (berita acara) -> pelepasan barang.
 */
class ClaimWindowTest extends TestCase
{
    use RefreshDatabase;

    private function region(): Region
    {
        return Region::create([
            'name' => 'Kelurahan Made',
            'type' => 'kelurahan',
            'latitude' => -7.2760,
            'longitude' => 112.6510,
        ]);
    }

    private function admin(?Region $region = null): User
    {
        return User::factory()->create([
            'role'      => 'admin_kelurahan',
            'region_id' => $region?->id,
        ]);
    }

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    /**
     * @return array{0: Report, 1: User}
     */
    private function foundReport(Region $region, User $owner, string $category = 'Elektronik'): array
    {
        $report = Report::create([
            'user_id'    => $owner->id,
            'type'       => 'found',
            'item_name'  => 'HP Test Found',
            'category'   => $category,
            'status'     => 'verified',
            'region_id'  => $region->id,
            'location'   => 'Kantor Kelurahan',
            'date'       => now()->subDay(),
        ]);

        return [$report, $owner];
    }

    // ─────────────────────────────────────────────────────────────
    // MASA KLAIM
    // ─────────────────────────────────────────────────────────────

    public function test_verifying_a_found_report_opens_a_30_day_claim_window(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        $report = Report::create([
            'user_id'   => $owner->id,
            'type'      => 'found',
            'item_name' => 'Dompet Hitam',
            'category'  => 'Dompet & Tas',
            'status'    => 'pending',
            'region_id' => $region->id,
            'location'  => 'Pasar',
            'date'      => now()->subDay(),
        ]);

        $this->actingAs($admin)
            ->put("/admin/reports/{$report->id}/verify", ['status' => 'verified'])
            ->assertRedirect();

        $report->refresh();

        $this->assertSame('verified', $report->status);
        $this->assertNotNull($report->claim_deadline, 'Masa klaim harus terbuka setelah verifikasi.');

        // Selisih satu detik antara "sekarang" dan waktu verifikasi bisa
        // membulatkan hasil diffInDays, jadi dicek dalam rentang 29-30 hari.
        $remaining = (int) now()->diffInDays($report->claim_deadline, false);
        $this->assertGreaterThanOrEqual(29, $remaining);
        $this->assertLessThanOrEqual(30, $remaining);
    }

    public function test_claim_window_is_reanchored_when_item_is_received_at_kelurahan(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);

        // Barang masuk kantor kelurahan 10 hari setelah verifikasi
        $report->update(['updated_at' => now()->subDays(10)]);

        $this->actingAs($admin)
            ->put("/admin/reports/{$report->id}/receive", ['serial_number' => '352099001761481'])
            ->assertRedirect();

        $report->refresh();

        $this->assertNotNull($report->received_at);
        $this->assertSame(
            30,
            (int) $report->received_at->diffInDays($report->claim_deadline, false),
            'Masa klaim dihitung dari waktu barang diterima, bukan dari verifikasi.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // PERINGATAN & KEDALUWARSA
    // ─────────────────────────────────────────────────────────────

    public function test_command_sends_warning_5_days_before_the_claim_window_ends(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['claim_deadline' => now()->addDays(3)]);

        $this->artisan('reports:check-expiry')->assertSuccessful();

        $this->assertTrue(
            Notification::where('user_id', $admin->id)
                ->where('title', 'like', '%Masa Klaim Hampir Habis%')
                ->exists(),
            'Admin wilayah harus diberi peringatan.'
        );

        $this->assertTrue(
            Notification::where('user_id', $owner->id)
                ->where('title', 'like', '%Masa Klaim Barang Temuan Anda Hampir Selesai%')
                ->exists(),
            'Penemu harus diberi peringatan.'
        );
    }

    public function test_command_marks_report_as_expired_when_the_window_passes(): void
    {
        $region = $this->region();
        $this->admin($region);
        $owner = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['claim_deadline' => now()->subDay()]);

        $this->artisan('reports:check-expiry')->assertSuccessful();

        $report->refresh();

        $this->assertSame('expired', $report->status);
        $this->assertNotNull($report->expired_at);
    }

    public function test_expired_report_is_still_claimable_so_owner_can_redeem_it(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update([
            'status'         => 'expired',
            'expired_at'     => now()->subDay(),
            'claim_deadline' => now()->subDay(),
        ]);

        $service = app(ClaimWindowService::class);

        $this->assertTrue(
            $service->isClaimable($report),
            'Barang yang lewat masa klaim masih boleh ditebus pemiliknya.'
        );
        $this->assertTrue(
            $service->isExpired($report),
            'Masa klaim yang sudah lewat terdeteksi.'
        );
    }

    public function test_command_escalates_to_super_admin_when_admin_does_not_follow_up(): void
    {
        $region = $this->region();
        $this->admin($region);
        $super  = $this->superAdmin();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update([
            'status'        => 'expired',
            'expired_at'    => now()->subDays(10),
            'claim_deadline' => now()->subDays(10),
        ]);

        $this->artisan('reports:check-expiry')->assertSuccessful();

        $this->assertTrue(
            Notification::where('user_id', $super->id)
                ->where('title', 'like', '%Tindak Lanjut Terlambat%')
                ->exists(),
            'Super admin harus diberi tahu kalau admin wilayah tidak menindaklanjuti.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // MATRIKS TINDAK LANJUT
    // ─────────────────────────────────────────────────────────────

    public function test_recommended_action_follows_the_category_matrix(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();
        $service = app(ClaimWindowService::class);

        $expectations = [
            'Kartu & Identitas'           => 'return_to_issuer',
            'Dokumen & Surat'             => 'return_to_issuer',
            'Uang'                        => 'hand_to_authority',
            'Elektronik'                  => 'hand_to_authority',
            'Dompet & Tas'                => 'hand_to_authority',
            'Pakaian & Aksesoris'         => 'donated',
            'Alat Tulis'                  => 'donated',
            'Perlengkapan Makan & Minum'  => 'donated',
        ];

        foreach ($expectations as $category => $expected) {
            [$report] = $this->foundReport($region, $owner, $category);

            $this->assertSame(
                $expected,
                $service->recommendedAction($report),
                "Kategori {$category} harus disarankan: {$expected}"
            );
        }
    }

    public function test_item_with_personal_data_is_recommended_for_destruction(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner, 'Dompet & Tas');
        $report->update(['pii_detected' => true]);

        $this->assertSame(
            'destroyed',
            app(ClaimWindowService::class)->recommendedAction($report),
            'Barang yang memuat data pribadi sebaiknya dimusnahkan dengan saksi.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // BERITA ACARA & PELEPASAN BARANG
    // ─────────────────────────────────────────────────────────────

    public function test_admin_can_open_the_followup_page_for_an_expired_report(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['status' => 'expired', 'expired_at' => now()->subDay()]);

        $this->actingAs($admin)
            ->get("/admin/reports/{$report->id}/followup")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/ReportFollowup')
                ->where('isExpired', true)
                ->has('actionOptions')
                ->has('followups')
            );
    }

    public function test_admin_outside_the_region_cannot_open_the_followup_page(): void
    {
        $region = $this->region();
        $other  = Region::create(['name' => 'Kelurahan Lontar', 'type' => 'kelurahan']);
        $admin  = $this->admin($other);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['status' => 'expired', 'expired_at' => now()->subDay()]);

        $this->actingAs($admin)
            ->get("/admin/reports/{$report->id}/followup")
            ->assertForbidden();
    }

    public function test_followup_requires_a_witness_and_a_note(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['status' => 'expired', 'expired_at' => now()->subDay()]);

        $this->actingAs($admin)
            ->post("/admin/reports/{$report->id}/followup", [
                'action'       => 'donated',
                'recipient_name' => 'Yayasan Harapan',
                'recipient_org'  => 'Yayasan Harapan',
                'witness_name' => '',
                'note'         => 'pendek',
            ])
            ->assertSessionHasErrors(['witness_name', 'note']);

        $this->assertSame(0, ReportFollowup::count());
    }

    public function test_followup_records_the_event_and_releases_the_item(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner, 'Pakaian & Aksesoris');
        $report->update([
            'status'         => 'expired',
            'expired_at'     => now()->subDay(),
            'secret_feature' => 'Tas branded dengan tali merah',
            'reported_imei'  => '352099001761481',
        ]);

        $this->actingAs($admin)
            ->post("/admin/reports/{$report->id}/followup", [
                'action'          => 'donated',
                'document_no'     => 'BA-001/Made/2026',
                'recipient_name'  => 'Yayasan Harapan',
                'recipient_org'   => 'Yayasan Harapan',
                'witness_name'    => 'Budi Santoso',
                'witness_phone'   => '08123456789',
                'note'            => 'Barang dihibahkan ke yayasan dengan berita acara.',
            ])
            ->assertRedirect(route('reports.show', $report->id));

        $this->assertSame(1, ReportFollowup::count());

        $followup = ReportFollowup::first();
        $this->assertSame('donated', $followup->action);
        $this->assertSame('Yayasan Harapan', $followup->recipient_name);
        $this->assertSame('Budi Santoso', $followup->witness_name);
        $this->assertSame($admin->id, $followup->created_by);

        $report->refresh();

        $this->assertSame('resolved', $report->status);
        $this->assertSame('donated', $report->resolution_type);
        $this->assertNotNull($report->released_at);
        $this->assertSame($admin->id, $report->released_by);

        // Data sensitif dihapus setelah barang dilepas
        $this->assertNull($report->secret_feature);
        $this->assertNull($report->reported_imei);
    }

    public function test_followup_is_blocked_while_a_claim_is_still_active(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();
        $other  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['status' => 'expired', 'expired_at' => now()->subDay()]);

        Claim::create([
            'report_id'   => $report->id,
            'claimant_id' => $other->id,
            'owner_id'    => $owner->id,
            'status'      => 'pending',
        ]);

        $this->actingAs($admin)
            ->post("/admin/reports/{$report->id}/followup", [
                'action'         => 'donated',
                'recipient_name' => 'Yayasan Harapan',
                'recipient_org'  => 'Yayasan Harapan',
                'witness_name'   => 'Budi Santoso',
                'note'           => 'Barang dihibahkan ke yayasan dengan berita acara.',
            ])
            ->assertSessionHas('error');

        $this->assertSame(0, ReportFollowup::count());
    }

    // ─────────────────────────────────────────────────────────────
    // KLAIM TE_BUS (REDEMPTION)
    // ─────────────────────────────────────────────────────────────

    public function test_owner_can_redeem_an_expired_item_and_the_claim_is_flagged_as_redemption(): void
    {
        $region = $this->region();
        $finder = User::factory()->create();
        $owner  = User::factory()->create();

        [$found] = $this->foundReport($region, $finder);
        $found->update(['status' => 'expired', 'expired_at' => now()->subDay()]);

        // Laporan hilang milik pengklaim
        $lost = Report::create([
            'user_id'   => $owner->id,
            'type'      => 'lost',
            'item_name' => 'HP Test Found',
            'category'  => 'Elektronik',
            'status'    => 'verified',
            'region_id' => $region->id,
            'location'  => 'Kampus',
            'date'      => now()->subDays(3),
        ]);

        $response = $this->actingAs($owner)->postJson("/claims/{$found->id}", [
            'lost_report_id' => $lost->id,
            'claimant_serial' => '352099001761481',
        ]);

        $response->assertCreated();

        $claim = Claim::first();

        $this->assertTrue($claim->is_redemption, 'Klaim atas barang kedaluwarsa ditandai sebagai tebus.');
        $this->assertNotNull($claim->redeemed_at);
        $this->assertSame('pending', $claim->status);
    }

    public function test_redeemed_item_is_resolved_with_claimed_resolution_type(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $finder = User::factory()->create();
        $owner  = User::factory()->create();

        [$found] = $this->foundReport($region, $finder);
        $found->update([
            'status'       => 'expired',
            'expired_at'   => now()->subDay(),
            'received_at'  => now()->subDays(5),
            'serial_number' => '352099001761481',
        ]);

        $lost = Report::create([
            'user_id'   => $owner->id,
            'type'      => 'lost',
            'item_name' => 'HP Test Found',
            'category'  => 'Elektronik',
            'status'    => 'verified',
            'region_id' => $region->id,
            'location'  => 'Kampus',
            'date'      => now()->subDays(3),
        ]);

        $claim = Claim::create([
            'report_id'      => $found->id,
            'lost_report_id' => $lost->id,
            'claimant_id'    => $owner->id,
            'owner_id'       => $finder->id,
            'status'         => 'pending',
            'is_redemption'  => true,
            'redeemed_at'    => now(),
        ]);

        // Admin menyetujui klaim
        $this->actingAs($admin)
            ->put("/admin/claims/{$claim->id}", [
                'status'    => 'approved',
                'admin_note' => 'Ciri barang cocok.',
            ])
            ->assertRedirect();

        // Admin mencatat serah terima
        $this->actingAs($admin)
            ->put("/admin/claims/{$claim->id}/handover", [
                'receiver_name'  => 'Budi Santoso',
                'receiver_id_type' => 'KTP',
                'handover_note'  => 'Diterima di kantor kelurahan.',
            ])
            ->assertRedirect();

        $found->refresh();

        $this->assertSame('resolved', $found->status);
        $this->assertSame('claimed', $found->resolution_type);
        $this->assertNotNull($found->released_at);
    }

    // ─────────────────────────────────────────────────────────────
    // PAPAN BARANG TEMUAN (PUBLIK)
    // ─────────────────────────────────────────────────────────────

    public function test_public_board_lists_verified_found_items_without_login(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner, 'Alat Tulis');
        $report->update(['claim_deadline' => now()->addDays(20)]);

        $this->get('/barang-temuan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/FoundBoard')
                ->has('reports')
                ->where('reports.0.item_name', 'HP Test Found')
                ->where('reports.0.days_remaining', 20)
            );
    }

    public function test_public_board_never_leaks_sensitive_data(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner, 'Kartu & Identitas');
        $report->update([
            'claim_deadline' => now()->addDays(20),
            'secret_feature' => 'Nomor seri kartu awal XY',
            'reported_imei'  => '352099001761481',
        ]);

        $response = $this->get('/barang-temuan')->assertOk();

        $payload = $response->viewData('page')['props'];

        $this->assertArrayNotHasKey('secret_feature', $payload['reports'][0]);
        $this->assertArrayNotHasKey('reported_imei', $payload['reports'][0]);
        $this->assertArrayNotHasKey('serial_number', $payload['reports'][0]);
    }

    public function test_public_board_hides_released_items(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update([
            'claim_deadline' => now()->addDays(20),
            'released_at'    => now(),
            'status'         => 'resolved',
        ]);

        $this->get('/barang-temuan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Public/FoundBoard')->where('reports', []));
    }

    // ─────────────────────────────────────────────────────────────
    // SINKRONISASI ON-READ (tidak bergantung scheduler)
    // ─────────────────────────────────────────────────────────────

    public function test_report_is_marked_expired_when_viewed_even_without_running_the_command(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['claim_deadline' => now()->subDay()]);

        // Scheduler belum pernah jalan - status masih 'verified'
        $this->assertSame('verified', $report->fresh()->status);

        $this->actingAs($owner)
            ->get("/reports/{$report->id}")
            ->assertOk();

        $report->refresh();

        $this->assertSame(
            'expired',
            $report->status,
            'Masa klaim yang lewat harus tetap berlaku walau scheduler belum sempat jalan.'
        );
        $this->assertNotNull($report->expired_at);
    }

    public function test_expired_report_is_marked_when_listed_in_public_board(): void
    {
        $region = $this->region();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner, 'Alat Tulis');
        $report->update(['claim_deadline' => now()->subDay()]);

        $this->get('/barang-temuan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/FoundBoard')
                ->where('reports.0.expired', true)
                ->where('reports.0.days_remaining', null)
                ->where('reports.0.can_redeem', true)
            );

        $this->assertSame('expired', $report->fresh()->status);
    }

    public function test_claim_on_an_overdue_item_is_flagged_as_redemption_without_the_command(): void
    {
        $region = $this->region();
        $finder = User::factory()->create();
        $owner  = User::factory()->create();

        [$found] = $this->foundReport($region, $finder);
        $found->update(['claim_deadline' => now()->subDay()]);

        $lost = Report::create([
            'user_id'   => $owner->id,
            'type'      => 'lost',
            'item_name' => 'HP Test Found',
            'category'  => 'Elektronik',
            'status'    => 'verified',
            'region_id' => $region->id,
            'location'  => 'Kampus',
            'date'      => now()->subDays(3),
        ]);

        $this->actingAs($owner)->postJson("/claims/{$found->id}", [
            'lost_report_id'   => $lost->id,
            'claimant_serial'  => '352099001761481',
        ])->assertCreated();

        $claim = Claim::first();

        $this->assertTrue(
            $claim->is_redemption,
            'Klaim terhadap barang yang lewat masa klaim harus ditandai tebus.'
        );
        $this->assertNotNull($claim->redeemed_at);
    }

    public function test_expiry_notification_is_sent_only_once_even_if_command_runs_repeatedly(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['claim_deadline' => now()->subDay()]);

        $this->artisan('reports:check-expiry')->assertSuccessful();
        $this->artisan('reports:check-expiry')->assertSuccessful();
        $this->artisan('reports:check-expiry')->assertSuccessful();

        $count = Notification::where('user_id', $admin->id)
            ->where('title', 'like', '%Barang Temuan Kedaluwarsa%')
            ->count();

        $this->assertSame(1, $count, 'Admin tidak boleh menerima notifikasi kedaluwarsa berulang.');
    }

    public function test_escalation_notification_is_not_repeated_every_day(): void
    {
        $region = $this->region();
        $this->admin($region);
        $super  = $this->superAdmin();
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update([
            'status'        => 'expired',
            'expired_at'    => now()->subDays(10),
            'claim_deadline' => now()->subDays(10),
        ]);

        $this->artisan('reports:check-expiry')->assertSuccessful();
        $this->artisan('reports:check-expiry')->assertSuccessful();

        $count = Notification::where('user_id', $super->id)
            ->where('title', 'like', '%Tindak Lanjut Terlambat%')
            ->count();

        $this->assertSame(1, $count, 'Eskalasi tidak boleh diulang tiap hari.');
    }

    public function test_claim_window_is_not_shifted_when_the_report_is_edited(): void
    {
        $region = $this->region();
        $admin  = $this->admin($region);
        $owner  = User::factory()->create();

        [$report] = $this->foundReport($region, $owner);
        $report->update(['claim_deadline' => now()->addDays(30)]);

        $originalDeadline = $report->fresh()->claim_deadline;

        // Admin mengoreksi privasi foto / admin edit laporan beberapa hari kemudian
        $report->update(['updated_at' => now()->addDays(5)]);
        $report->update(['description' => 'Deskripsi diperbarui.']);

        app(ClaimWindowService::class)->openWindow($report->fresh());

        $this->assertEquals(
            $originalDeadline->timestamp,
            $report->fresh()->claim_deadline->timestamp,
            'Masa klaim tidak boleh bergeser karena laporan diedit.'
        );
    }
}
