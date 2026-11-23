<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use App\Models\Report;
use App\Services\ClaimWindowService;
use Illuminate\Console\Command;

/**
 * Menangani masa klaim barang temuan:
 *
 *  - Memberi peringatan ke admin + penemu ketika masa klaim hampir habis.
 *  - Menandai laporan sebagai "Kedaluwarsa" ketika masa klaim habis.
 *  - Mengeskalasi ke super admin kalau admin wilayah tidak menindaklanjuti.
 *
 * Dijadwalkan harian lewat routes/console.php.
 */
class CheckReportExpiry extends Command
{
    protected $signature = 'reports:check-expiry';

    protected $description = 'Kirim peringatan masa klaim hampir habis & tandai laporan temuan kedaluwarsa';

    public function handle(): int
    {
        $service = app(ClaimWindowService::class);

        $reminderDays = (int) config('temubarang.expiry_reminder_days');
        $escalationDays = (int) config('temubarang.escalation_days');

        $reminded = 0;
        $expired = 0;
        $escalated = 0;

        // ── 1. PERINGATAN: masa klaim hampir habis ──────────────────────
        $expiring = Report::with(['user', 'region'])
            ->where('type', 'found')
            ->where('status', 'verified')
            ->whereNotNull('claim_deadline')
            ->whereBetween('claim_deadline', [now(), now()->addDays($reminderDays)])
            ->get();

        foreach ($expiring as $report) {
            $remaining = $service->daysRemaining($report);
            $deadline = $report->claim_deadline->format('d M Y');

            // 1) Admin kelurahan
            foreach (NotificationHelper::adminsOfRegion($report->region_id) as $admin) {
                if (NotificationHelper::sendOncePerReport(
                    $admin->id,
                    '⏳ Masa Klaim Hampir Habis',
                    "Masa klaim barang temuan \"{$report->item_name}\" berakhir pada {$deadline} (" .
                    $remaining . " hari lagi). Jika tidak ada yang mengklaim, laporan akan berstatus Kedaluwarsa " .
                    "dan perlu tindak lanjut. Barang tetap bisa ditebus pemiliknya sampai benar-benar dilepas.",
                    'warning',
                    "/reports/{$report->id}"
                )) {
                    $reminded++;
                }
            }

            // 2) Penemu barang
            if ($report->user_id) {
                if (NotificationHelper::sendOncePerReport(
                    $report->user_id,
                    '⏳ Masa Klaim Barang Temuan Anda Hampir Selesai',
                    "Barang \"{$report->item_name}\" yang Anda temukan akan masuk status Kedaluwarsa pada {$deadline}. " .
                    "Barang masih tersimpan di kantor kelurahan dan pemilik masih bisa menebusnya. " .
                    "Mohon cooperation untuk menyerahkan barang ke kantor kelurahan.",
                    'info',
                    "/reports/{$report->id}"
                )) {
                    $reminded++;
                }
            }
        }

        // ── 2. KEDALUWARSA: masa klaim habis ───────────────────────────
        $overdue = Report::with(['user', 'region'])
            ->where('type', 'found')
            ->where('status', 'verified')
            ->whereNotNull('claim_deadline')
            ->where('claim_deadline', '<=', now())
            ->get();

        foreach ($overdue as $report) {
            // expire() sekaligus mengirim notifikasi ke admin + penemu.
            // Kalau statusnya sudah diubah duluan oleh sinkronisasi on-read,
            // expire() mengembalikan false dan notifikasi tidak dobel.
            if ($service->expire($report)) {
                $expired++;
            }
        }

        // ── 3. ESKALASI: admin tidak menindaklanjuti ───────────────────
        if ($escalationDays > 0) {
            $stale = Report::with('region')
                ->where('type', 'found')
                ->where('status', 'expired')
                ->whereNotNull('expired_at')
                ->where('expired_at', '<=', now()->subDays($escalationDays))
                ->whereNull('released_at')
                ->get();

            foreach ($stale as $report) {
                $supers = \App\Models\User::where('role', 'super_admin')->get();

                foreach ($supers as $admin) {
                    // Sekali per laporan: kalau tidak, super admin menerima
                    // notifikasi yang sama setiap hari selama laporan belum
                    // ditindaklanjuti.
                    $sent = NotificationHelper::sendOncePerReport(
                        $admin->id,
                        '⚠️ Tindak Lanjut Terlambat',
                        "Laporan barang temuan \"{$report->item_name}\" di " .
                        ($report->region?->name ?? 'kelurahan') . " sudah berstatus Kedaluwarsa lebih dari {$escalationDays} hari " .
                        "dan belum ada berita acara tindak lanjut. Mohon tindak lanjuti.",
                        'error',
                        "/admin/reports/{$report->id}/followup"
                    );

                    if ($sent) {
                        $escalated++;
                    }
                }
            }
        }

        $this->info("Peringatan dikirim : {$reminded}");
        $this->info("Laporan kedaluwarsa : {$expired}");
        $this->info("Eskalasi           : {$escalated}");

        return self::SUCCESS;
    }
}
