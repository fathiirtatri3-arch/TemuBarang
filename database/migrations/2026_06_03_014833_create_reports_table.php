<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['lost', 'found']);
            $table->string('item_name');
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->string('location');
            $table->date('date');
            $table->string('photo')->nullable();
            $table->enum('status', ['pending', 'verified', 'matched', 'resolved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
