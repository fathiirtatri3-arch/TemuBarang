<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'item_name',
        'category',
        'description',
        'color',
        'location',
        'date',
        'photo',
        'status',
        'region_id',         
        'latitude',          
        'longitude',         
        'location_detail',
        'secret_feature',
        'received_at',
        'received_by',
        'rejection_reason',
        'photo_original',
        'photo_sensitive',
        'serial_number',
    ];

    protected $casts = [
        'date' => 'date',
        'received_at' => 'datetime',
        'photo_sensitive' => 'boolean',
    ];

    // Ciri rahasia tidak boleh ikut terkirim ke browser/JSON
    protected $hidden = ['secret_feature', 'rejection_reason', 'photo_original', 'serial_number'];

    // Hanya penanda (tanpa path) bahwa foto asli tersimpan privat
    protected $appends = ['has_original_photo'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

        /**
     * Batasi laporan sesuai role:
     * - super_admin     : semua laporan
     * - admin_kelurahan : laporan di wilayahnya (+ laporan miliknya sendiri)
     * - warga           : laporan miliknya sendiri
     */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        if ($user->isAdminKelurahan() && $user->region_id) {
            return $query->where(function ($q) use ($user) {
                $q->where('region_id', $user->region_id)
                  ->orWhere('user_id', $user->id);
            });
        }

        return $query->where('user_id', $user->id);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function getHasOriginalPhotoAttribute(): bool
    {
        return !empty($this->attributes['photo_original'] ?? null);
    }

    protected static function booted()
    {
        // Hapus juga foto asli di disk privat saat laporan dihapus
        static::deleting(function ($report) {
            if ($report->photo_original) {
                \Illuminate\Support\Facades\Storage::disk('local')->delete($report->photo_original);
            }
        });
    }
}