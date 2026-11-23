<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * KOREKSI backfill masa klaim.
 *
 * Migration sebelumnya mengisi claim_deadline = now() untuk laporan temuan
 * yang sudah diverifikasi. Akibatnya masa klaim langsung habis: laporan
 * yang belum sempat diberi tahu apa pun langsung berstatus "Kedaluwarsa"
 * begitu command reports:check-expiry dijalankan.
 *
 * Yang diperbaiki di sini:
 * - Laporan yang KEDALUWARSA hanya karena backfill tersebut (tidak ada
 *   berita acara, tidak ada klaim, belum dilepas) dikembalikan ke status
 *   "verified" dengan masa klaim penuh 30 hari ke depan.
 * - Laporan temuan lain yang belum punya claim_deadline diberi masa klaim
 *   penuh juga, dihitung dari waktu verifikasi.
 *
 * Laporan yang sudah benar-benar ditangani (ada berita acara / sudah dilepas)
 * TIDAK disentuh.
 */
return new class extends Migration
{
    public function up(): void
    {
        $windowDays = (int) config('temubarang.claim_window_days', 30);

        // 1) Buka lagi laporan yang dipaksa kedaluwarsa oleh backfill lama.
        //    Syarat: tidak ada berita acara, tidak ada klaim, belum dilepas.
        $affected = DB::table('reports')
            ->where('type', 'found')
            ->where('status', 'expired')
            ->whereNull('released_at')
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('report_followups')
                    ->whereColumn('report_followups.report_id', 'reports.id');
            })
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('claims')
                    ->whereColumn('claims.report_id', 'reports.id');
            })
            ->update([
                'status'         => 'verified',
                'expired_at'     => null,
                'claim_deadline' => now()->addDays($windowDays),
            ]);

        // 2) Laporan temuan terverifikasi yang belum punya masa klaim
        //    (mis. laporan yang diverifikasi tanpa lewat route verifikasi).
        $missing = DB::table('reports')
            ->where('type', 'found')
            ->where('status', 'verified')
            ->whereNull('claim_deadline')
            ->update([
                'claim_deadline' => now()->addDays($windowDays),
            ]);

        if ($affected > 0 || $missing > 0) {
            Log::info("Koreksi backfill masa klaim: {$affected} laporan dikembalikan, {$missing} laporan masa klaimnya dibuka.");
        }
    }

    public function down(): void
    {
        // Tidak ada yang dikembalikan: masa klaim yang sudah dibuka tetap
        // dibiarkan apa adanya.
    }
};
