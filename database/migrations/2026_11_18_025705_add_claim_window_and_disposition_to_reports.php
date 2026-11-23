<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Siklus hidup barang temuan yang lewat masa klaim.
 *
 * pending -> verified -> [matched -> resolved]   (ada yang mengklaim)
 *                      -> expired  -> [resolved]  (tidak ada, masuk tindak lanjut)
 *
 * Status 'expired' (Kedaluwarsa) BUKAN berarti barang hilang atau milik negara.
 * Barang masih tersimpan di kantor kelurahan dan masih bisa ditebus pemiliknya
 * sampai benar-benar dilepas lewat berita acara.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tambah status 'expired' (Kedaluwarsa)
        DB::statement("ALTER TABLE reports MODIFY COLUMN status ENUM(
            'pending','verified','matched','resolved','rejected','expired'
        ) NOT NULL DEFAULT 'pending'");

        Schema::table('reports', function (Blueprint $table) {
            // --- Masa klaim ---
            $table->timestamp('claim_deadline')->nullable()->after('imei_verified_at');
            $table->timestamp('expired_at')->nullable()->after('claim_deadline');
            $table->timestamp('released_at')->nullable()->after('expired_at');

            // --- Tindak lanjut / pelepasan barang ---
            $table->enum('resolution_type', [
                'claimed',            // diklaim pemilik (serah terima biasa)
                'return_to_issuer',   // dikembalikan ke penerbit (Dukcapil, bank, sekolah)
                'hand_to_authority',  // diserahkan ke instansi berwenang
                'donated',            // dihibahkan ke lembaga sosial
                'destroyed',          // dimusnahkan dengan saksi
            ])->nullable()->after('released_at');

            $table->foreignId('released_by')->nullable()->after('resolution_type')
                ->constrained('users')->nullOnDelete();

            $table->index('claim_deadline', 'reports_claim_deadline_index');
            $table->index(['type', 'status'], 'reports_type_status_index');
        });

        // Laporan temuan yang sudah diverifikasi SEBELUM fitur ini:
        // buka masa klaimnya 30 hari ke depan (bukan langsung kedaluwarsa).
        // Kalau diisi dengan now(), barangnya langsung dianggap lewat masa klaim
        // padahal belum ada satu pun yang diberi tahu.
        DB::table('reports')
            ->where('type', 'found')
            ->where('status', 'verified')
            ->whereNull('claim_deadline')
            ->update([
                'claim_deadline' => now()->addDays((int) config('temubarang.claim_window_days', 30)),
            ]);
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex('reports_claim_deadline_index');
            $table->dropIndex('reports_type_status_index');

            $table->dropConstrainedForeignId('released_by');
            $table->dropColumn([
                'claim_deadline',
                'expired_at',
                'released_at',
                'resolution_type',
            ]);
        });

        DB::statement("ALTER TABLE reports MODIFY COLUMN status ENUM(
            'pending','verified','matched','resolved','rejected'
        ) NOT NULL DEFAULT 'pending'");
    }
};
