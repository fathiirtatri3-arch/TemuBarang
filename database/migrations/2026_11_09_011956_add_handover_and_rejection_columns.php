<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->timestamp('handed_over_at')->nullable();
            $table->foreignId('handed_over_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receiver_name')->nullable();
            $table->string('receiver_id_type', 30)->nullable();
            $table->text('handover_note')->nullable();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });

        Schema::table('claims', function (Blueprint $table) {
            $table->dropConstrainedForeignId('handed_over_by');
            $table->dropColumn(['handed_over_at', 'receiver_name', 'receiver_id_type', 'handover_note']);
        });
    }
};