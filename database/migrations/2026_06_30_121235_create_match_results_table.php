<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id_1')->constrained('reports')->onDelete('cascade');
            $table->foreignId('report_id_2')->constrained('reports')->onDelete('cascade');
            $table->decimal('photo_score', 5, 2)->default(0);
            $table->decimal('text_score', 5, 2)->default(0);
            $table->decimal('final_score', 5, 2)->default(0);
            $table->string('label');
            $table->timestamps();

            $table->unique(['report_id_1', 'report_id_2']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_results');
    }
};