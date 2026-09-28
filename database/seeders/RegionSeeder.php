<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Region;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        // Kecamatan Sambikerep
        $kecamatan = Region::create([
            'name' => 'Kecamatan Sambikerep',
            'type' => 'kecamatan',
            'latitude' => -7.2745,
            'longitude' => 112.6585,
            'bounds_north' => -7.2500,
            'bounds_south' => -7.3000,
            'bounds_east' => 112.6800,
            'bounds_west' => 112.6300,
        ]);

        // 4 Kelurahan
        $kelurahan = [
            ['name' => 'Kelurahan Made', 'lat' => -7.2760, 'lng' => 112.6510],
            ['name' => 'Kelurahan Bringin', 'lat' => -7.2690, 'lng' => 112.6620],
            ['name' => 'Kelurahan Lontar', 'lat' => -7.2810, 'lng' => 112.6680],
            ['name' => 'Kelurahan Sambikerep', 'lat' => -7.2720, 'lng' => 112.6550],
        ];

        foreach ($kelurahan as $kel) {
            Region::create([
                'name' => $kel['name'],
                'type' => 'kelurahan',
                'parent_id' => $kecamatan->id,
                'latitude' => $kel['lat'],
                'longitude' => $kel['lng'],
            ]);
        }
    }
}