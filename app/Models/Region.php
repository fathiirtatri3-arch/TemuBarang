<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'parent_id',
        'latitude',
        'longitude',
        'bounds_north',
        'bounds_south',
        'bounds_east',
        'bounds_west',
        'kecamatan',
        'kota',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'bounds_north' => 'decimal:7',
        'bounds_south' => 'decimal:7',
        'bounds_east' => 'decimal:7',
        'bounds_west' => 'decimal:7',
    ];

    // Relasi ke parent (kecamatan → kelurahan)
    public function parent()
    {
        return $this->belongsTo(Region::class, 'parent_id');
    }

    // Relasi ke children (kecamatan punya banyak kelurahan)
    public function children()
    {
        return $this->hasMany(Region::class, 'parent_id');
    }

    // Relasi ke users
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Relasi ke reports
    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}