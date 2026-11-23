<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Region;
use App\Models\Report;
use App\Models\User;
use App\Services\ClaimWindowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Skenario HTTP end-to-end untuk siklus masa klaim 30 hari.
 *
 * Fokusnya: masa klaim harus tetap berlaku WALAU scheduler harian belum
 * sempat jalan. Ini skenario yang paling sering luput saat cron server mati.
 */
class ClaimWindowHttpTest extends TestCase
{
    use RefreshDatabase;

    private function region(): Region
    {
        return Region::create([
            'name' => 'Kelurahan Made',
            'type' => 'kelurahan',
        ]);
    }

    public function test_full_cycle_works_without_the_scheduler_running(): void
    {
        $region = $this->region();
        $admin  = User::factory()->create(['role' => 'admin_kelurahan', 'region_id' => $region->id]);
        $finder = User::factory()->create();
        $owner  = User::factory()->create();

        // 1) Penemu membuat laporan temuan
        $report = Report::create([
            'user_id'       => $finder->id,
            'type'          => 'found',
            'item_name'     => 'Tumbler Hijau',
            'category'      => 'Perlengkapan Makan & Minum',
            'description'   => 'Ditemukan di taman, ada sticker kecil di tutup',
            'color'         => 'Hijau',
            'location'      => 'Taman Kota',
            'date'          => now()->subDays(35),
            'status'        => 'pending',
            'region_id'     => $region->id,
            'latitude'      => -7.39,
            'longitude'     => 112.69,
            'secret_feature' => 'Sticker luna di tutup',
        ]);

        // 2) Admin verifikasi -> masa klaim 30 hari terbuka
        $this->actingAs($admin)
            ->put("/admin/reports/{$report->id}/verify", ['status' => 'verified'])
            ->assertRedirect();

        $report->refresh();
        $this->assertSame('verified', $report->status);
        $this->assertNotNull($report->claim_deadline);
        $this->assertGreaterThanOrEqual(29, app(ClaimWindowService::class)->daysRemaining($report));

        // 3) Barang masuk kantor kelurahan -> masa klaim dihitung ulang
        $this->actingAs($admin)
            ->put("/admin/reports/{$report->id}/receive", [])
            ->assertRedirect();

        $report->refresh();
        $this->assertNotNull($report->received_at);
        $this->assertSame(30, (int) $report->received_at->diffInDays($report->claim_deadline, false));

        // 4) 30 hari berlalu tanpa ada yang mengklaim.
        //    Scheduler sengaja TIDAK dijalankan di sini.
        $report->update(['claim_deadline' => now()->subDay()]);
        $this->assertSame('verified', $report->fresh()->status);

        // 5) Pemilik yang kehilangan barang membuka halaman detail.
        //    Status harus langsung Kedaluwarsa walau scheduler mati.
        $this->actingAs($owner)
            ->get("/reports/{$report->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('report.status', 'expired')
                ->has('report.claim_deadline')
            );

        $this->assertSame('expired', $report->fresh()->status);
        $this->assertNotNull($report->fresh()->expired_at);

        // 6) Admin melihat dashboard -> laporan tampil Kedaluwarsa
        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('reports.0.status', 'expired'));

        // 7) Papan temuan publik tanpa login -> tampil kedaluwarsa & bisa tebus
        $this->get('/barang-temuan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('reports.0.expired', true)
                ->where('reports.0.can_redeem', true)
                ->where('reports.0.days_remaining', null)
            );

        // 8) Admin & penemu sudah diberi tahu
        $this->assertTrue(
            Notification::where('user_id', $admin->id)
                ->where('title', 'like', '%Kedaluwarsa%')
                ->exists(),
            'Admin harus diberi tahu bahwa masa klaim habis.'
        );

        $this->assertTrue(
            Notification::where('user_id', $finder->id)
                ->where('title', 'like', '%Berakhir%')
                ->exists(),
            'Penemu harus diberi tahu bahwa masa klaim barangnya berakhir.'
        );

        // 9) Scheduler yang baru jalan belakangan tidak mengirim notifikasi dobel
        $this->artisan('reports:check-expiry')->assertSuccessful();
        $this->artisan('reports:check-expiry')->assertSuccessful();

        $this->assertSame(
            1,
            Notification::where('user_id', $admin->id)
                ->where('title', 'like', '%Kedaluwarsa%')
                ->count(),
            'Notifikasi kedaluwarsa tidak boleh dobel.'
        );
    }

    public function test_owner_can_redeem_an_item_whose_window_passed_without_running_the_command(): void
    {
        $region = $this->region();
        $finder = User::factory()->create();
        $owner  = User::factory()->create();

        $found = Report::create([
            'user_id'   => $finder->id,
            'type'      => 'found',
            'item_name' => 'Tumbler Hijau',
            'category'  => 'Perlengkapan Makan & Minum',
            'description' => 'Ditemukan di taman',
            'color'     => 'Hijau',
            'location'  => 'Taman Kota',
            'date'      => now()->subDays(35),
            'status'    => 'verified',
            'region_id' => $region->id,
            'latitude'  => -7.39,
            'longitude' => 112.69,
            'secret_feature' => 'Sticker luna di tutup',
        ]);

        $found->update([
            'received_at'   => now()->subDays(31),
            'claim_deadline' => now()->subDay(),
        ]);

        $lost = Report::create([
            'user_id'   => $owner->id,
            'type'      => 'lost',
            'item_name' => 'Tumbler Hijau',
            'category'  => 'Perlengkapan Makan & Minum',
            'description' => 'Hilang di taman, ada sticker di tutup',
            'color'     => 'Hijau',
            'location'  => 'Taman Kota',
            'date'      => now()->subDays(36),
            'status'    => 'verified',
            'region_id' => $region->id,
            'latitude'  => -7.39,
            'longitude' => 112.69,
        ]);

        $this->actingAs($owner)
            ->postJson("/claims/{$found->id}", [
                'lost_report_id'  => $lost->id,
                'claimant_proof'  => 'Sticker luna di tutup',
                'message'         => 'Ini tumbler saya.',
            ])
            ->assertCreated();

        $claim = \App\Models\Claim::first();

        $this->assertTrue($claim->is_redemption, 'Klaim terhadap barang lewat masa klaim adalah klaim tebus.');
        $this->assertNotNull($claim->redeemed_at);
        $this->assertSame('expired', $found->fresh()->status);
    }
}
