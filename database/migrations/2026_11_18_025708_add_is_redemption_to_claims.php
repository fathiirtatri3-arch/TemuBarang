<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Klaim "tebus": pengclaiming menebus barang yang masa klaimnya sudah habis
 * (status 'expired'). Bedanya dengan klaim biasa, adminsnya diberi tahu bahwa
 * ini pelepasan barang yang tertunda, bukan klaim biasa.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->boolean('is_redemption')->default(false)->after('status');
            $table->timestamp('redeemed_at')->nullable()->after('is_redemption');
        });
    }

    public function down(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn(['is_redemption', 'redeemed_at']);
        });
    }
};
