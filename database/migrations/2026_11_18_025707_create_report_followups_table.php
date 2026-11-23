<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Berita acara tindak lanjut barang temuan yang lewat masa klaim.
 *
 * Setiap pelepasan barang WAJIB punya berita acara: siapa yang menerima,
 * instansi mana, siapa saksinya, kapan, dan bukti fotonya.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->onDelete('cascade');

            // Jenis tindak lanjut
            $table->enum('action', [
                'return_to_issuer',   // dikembalikan ke penerbit (Dukcapil, bank, sekolah)
                'hand_to_authority',  // diserahkan ke instansi berwenang
                'donated',            // dihibahkan ke lembaga sosial
                'destroyed',          // dimusnahkan dengan saksi
            ]);

            // Nomor berita acara (dicetak/dicatat admin)
            $table->string('document_no')->nullable();

            // --- Penerima barang ---
            $table->string('recipient_name')->nullable();
            $table->string('recipient_org')->nullable();
            $table->string('recipient_contact')->nullable();
            $table->string('recipient_id_number')->nullable();

            // --- Saksi ---
            $table->string('witness_name')->nullable();
            $table->string('witness_name_2')->nullable();
            $table->string('witness_phone')->nullable();

            // --- Keterangan & bukti ---
            $table->text('note')->nullable();
            $table->string('photo')->nullable();

            // --- Jejak audit ---
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('executed_at');
            $table->timestamps();

            $table->index('report_id', 'report_followups_report_id_index');
            $table->index('action', 'report_followups_action_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_followups');
    }
};
