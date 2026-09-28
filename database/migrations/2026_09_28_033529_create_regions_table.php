<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Contoh: "Kelurahan Made"
            $table->enum('type', ['kecamatan', 'kelurahan', 'rw']);
            $table->foreignId('parent_id')->nullable()->constrained('regions')->onDelete('cascade');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('bounds_north', 10, 7)->nullable();
            $table->decimal('bounds_south', 10, 7)->nullable();
            $table->decimal('bounds_east', 10, 7)->nullable();
            $table->decimal('bounds_west', 10, 7)->nullable();
            $table->string('kecamatan')->default('Sambikerep');
            $table->string('kota')->default('Surabaya');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};