<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Isi ulang penanda reports.photo_blurred.
 *
 * Laporan yang dibuat SEBELUM kolom photo_blurred ada (dan Reports\Report::protect()
 * versi lama) sudah memakai versi buram di disk publik, tapi penandanya masih
 * false karena kolomnya belum ada.
 *
 * Invariant: photo_original terisi = foto publik saat ini adalah versi buram.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('reports')
            ->whereNotNull('photo_original')
            ->where('photo_blurred', false)
            ->update(['photo_blurred' => true]);
    }

    public function down(): void
    {
        // Penanda kembali diturunkan ke false untuk laporan yang di-backfill.
        // Tidak ada cara membedakan baris lama vs baru tanpa kolom tambahan,
        // jadi dibiarkan apa adanya (tidak merusak apa pun).
    }
};
