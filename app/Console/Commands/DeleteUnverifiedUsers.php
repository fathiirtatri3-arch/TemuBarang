<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class DeleteUnverifiedUsers extends Command
{
    protected $signature = 'users:delete-unverified';
    protected $description = 'Hapus akun yang belum verifikasi email lebih dari 3 hari';

    public function handle()
    {
        $deleted = User::whereNull('email_verified_at')
            ->where('created_at', '<', now()->subDays(3))
            ->delete();

        $this->info("$deleted akun tidak terverifikasi berhasil dihapus.");
    }
}