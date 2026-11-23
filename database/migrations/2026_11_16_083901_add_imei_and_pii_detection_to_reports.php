<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom untuk revisi dari guru:
     * - Nomor seri / IMEI yang DILAPORKAN penemu (atau pemilik laporan hilang)
     * - Nomor IMEI yang DIBACA admin dari perangkat fisik
     * - Hasil deteksi data pribadi otomatis (OCR + deteksi wajah)
     * - Status samaran foto publik + jejak koreksi manual admin
     */
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // --- Nomor seri / IMEI ---
            $table->string('reported_imei', 20)->nullable()->after('serial_number');
            $table->boolean('imei_unreadable')->default(false)->after('reported_imei');
            $table->timestamp('imei_verified_at')->nullable()->after('imei_unreadable');

            // --- Deteksi data pribadi otomatis ---
            $table->boolean('pii_detected')->default(false)->after('imei_verified_at');
            $table->json('pii_reasons')->nullable()->after('pii_detected');
            // none | detected | cleared (admin membuka samaran) | forced (admin menyamarkan)
            $table->string('pii_status', 20)->default('none')->after('pii_reasons');
            $table->timestamp('pii_checked_at')->nullable()->after('pii_status');
            $table->string('pii_check_error', 255)->nullable()->after('pii_checked_at');

            // --- Status samaran foto publik ---
            // true = foto yang tampil publik adalah versi buram
            $table->boolean('photo_blurred')->default(false)->after('photo_sensitive');

            // --- Jejak koreksi manual oleh admin ---
            $table->foreignId('privacy_override_by')->nullable()->after('photo_blurred')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('privacy_override_at')->nullable()->after('privacy_override_by');
        });

        // Index untuk pencarian laporan yang perlu dicek admin
        Schema::table('reports', function (Blueprint $table) {
            $table->index('pii_status', 'reports_pii_status_index');
            $table->index('reported_imei', 'reports_reported_imei_index');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex('reports_pii_status_index');
            $table->dropIndex('reports_reported_imei_index');

            $table->dropConstrainedForeignId('privacy_override_by');

            $table->dropColumn([
                'reported_imei',
                'imei_unreadable',
                'imei_verified_at',
                'pii_detected',
                'pii_reasons',
                'pii_status',
                'pii_checked_at',
                'pii_check_error',
                'photo_blurred',
                'privacy_override_by',
                'privacy_override_at',
            ]);
        });
    }
};
