<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('users:delete-unverified')->cron('0 2 * * 1,4');

/*
| Masa klaim barang temuan: peringatan H-5, penandaan kedaluwarsa, dan
| eskalasi ke super admin bila admin wilayah tidak menindaklanjuti.
| Dijadwalkan setiap hari tepat pagi.
*/
Schedule::command('reports:check-expiry')->dailyAt('06:15');