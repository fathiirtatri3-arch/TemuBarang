<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('photo_original')->nullable();
            $table->boolean('photo_sensitive')->default(false);
            $table->string('serial_number', 100)->nullable();
        });

        Schema::table('claims', function (Blueprint $table) {
            $table->string('claimant_serial', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn('claimant_serial');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['photo_original', 'photo_sensitive', 'serial_number']);
        });
    }
};