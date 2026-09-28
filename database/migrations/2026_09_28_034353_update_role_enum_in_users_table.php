<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin_kelurahan', 'admin', 'user', 'student') DEFAULT 'user'");
        
        // Update data lama
        DB::table('users')->where('role', 'admin')->update(['role' => 'super_admin']);
        DB::table('users')->where('role', 'student')->update(['role' => 'user']);
    }

    public function down(): void
    {
        // Kembalikan data dulu sebelum ubah ENUM
        DB::table('users')->where('role', 'super_admin')->update(['role' => 'admin']);
        DB::table('users')->where('role', 'admin_kelurahan')->update(['role' => 'admin']);
        DB::table('users')->where('role', 'user')->update(['role' => 'student']);
        
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'student') DEFAULT 'student'");
    }
};
