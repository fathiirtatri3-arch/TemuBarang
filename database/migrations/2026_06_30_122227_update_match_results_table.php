<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_results', function (Blueprint $table) {
            $table->decimal('text_score', 5, 2)->default(0)->change();
            $table->decimal('final_score', 5, 2)->default(0)->change();
            $table->string('label')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('match_results', function (Blueprint $table) {
            $table->decimal('text_score', 5, 2)->change();
            $table->decimal('final_score', 5, 2)->change();
            $table->string('label')->change();
        });
    }
};