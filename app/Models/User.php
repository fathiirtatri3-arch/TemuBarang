<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Region;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'region_id',      
        'phone',          
        'is_verified',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke laporan (seorang user punya banyak laporan)
     */
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    /**
     * Relasi ke notifikasi (seorang user punya banyak notifikasi)
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    /* ---------- Helper role & wilayah ---------- */

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdminKelurahan(): bool
    {
        return $this->role === 'admin_kelurahan';
    }

    public function isAdmin(): bool
    {
        return $this->isSuperAdmin() || $this->isAdminKelurahan();
    }

    /**
     * Boleh mengelola (verifikasi / edit / hapus / putuskan klaim)
     * data milik wilayah tertentu?
     */
    public function canManageRegion($regionId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->isAdminKelurahan()
            && $this->region_id !== null
            && $regionId !== null
            && (int) $this->region_id === (int) $regionId;
    }

    /**
     * Boleh melihat foto ASLI (tanpa blur) sebuah laporan?
     * Pemilik laporan, admin wilayah laporan, atau admin wilayah yang memutuskan
     * klaim yang merujuk laporan hilang ini.
     */
    public function canViewOriginalPhoto(Report $report): bool
    {
        if ($report->user_id === $this->id || $this->canManageRegion($report->region_id)) {
            return true;
        }

        if ($this->isAdminKelurahan() && $this->region_id) {
            return Claim::where('lost_report_id', $report->id)
                ->whereHas('report', fn ($q) => $q->where('region_id', $this->region_id))
                ->exists();
        }

        return false;
    }
}