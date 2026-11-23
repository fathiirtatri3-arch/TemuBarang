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
        'reported_imei',
        'imei_unreadable',
        'imei_verified_at',
        'pii_detected',
        'pii_reasons',
        'pii_status',
        'pii_checked_at',
        'pii_check_error',
        'photo_blurred',
        'privacy_override_by',
        'privacy_override_at',
        'claim_deadline',
        'expired_at',
        'released_at',
        'resolution_type',
        'released_by',
    ];

    protected $casts = [
        'date' => 'date',
        'received_at' => 'datetime',
        'photo_sensitive' => 'boolean',
        'photo_blurred' => 'boolean',
        'pii_detected' => 'boolean',
        'imei_unreadable' => 'boolean',
        'pii_reasons' => 'array',
        'imei_verified_at' => 'datetime',
        'pii_checked_at' => 'datetime',
        'claim_deadline' => 'datetime',
        'expired_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    // Ciri rahasia, nomor seri, dan jejak pemeriksaan tidak boleh ikut terkirim
    // ke browser/JSON. Data ini dikirim eksplisit di halaman yang memang butuh.
    protected $hidden = [
        'secret_feature',
        'rejection_reason',
        'photo_original',
        'serial_number',
        'reported_imei',
        'imei_unreadable',
        'imei_verified_at',
        'pii_reasons',
        'pii_check_error',
        'privacy_override_by',
        'privacy_override_at',
        'released_by',
    ];

    // Hanya penanda (tanpa path) bahwa foto asli tersimpan privat
    protected $appends = ['has_original_photo', 'has_reported_imei', 'is_photo_blurred'];

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

    /**
     * Berita acara tindak lanjut (pelepasan barang).
     */
    public function followups()
    {
        return $this->hasMany(ReportFollowup::class);
    }

    /**
     * Admin yang mencatat pelepasan barang.
     */
    public function releaser()
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function getHasOriginalPhotoAttribute(): bool
    {
        return !empty($this->attributes['photo_original'] ?? null);
    }

    /**
     * Penanda: apakah laporan punya nomor seri/IMEI yang dilaporkan.
     * (Nilai IMEI-nya sendiri tidak ikut ke browser.)
     */
    public function getHasReportedImeiAttribute(): bool
    {
        return !empty($this->attributes['reported_imei'] ?? null);
    }

    /**
     * Penanda untuk frontend: apakah foto publiknya versi buram.
     */
    public function getIsPhotoBlurredAttribute(): bool
    {
        return $this->isPhotoBlurred();
    }

    /**
     * Apakah laporan ini punya nomor seri/IMEI yang dilaporkan (bukan "tidak bisa membaca")?
     */
    public function hasReportedImei(): bool
    {
        return !empty($this->attributes['reported_imei'] ?? null);
    }

    /**
     * Apakah foto laporan ini sedang disamarkan untuk publik?
     *
     * photo_blurred = foto publik SAAT INI adalah versi buram.
     * photo_sensitive = kunci keras (kategori sensitif) -> pasti buram.
     * photo_original terisi = pasti buram (foto asli ada di disk privat).
     */
    public function isPhotoBlurred(): bool
    {
        return (bool) ($this->attributes['photo_blurred'] ?? false)
            || (bool) ($this->attributes['photo_sensitive'] ?? false)
            || !empty($this->attributes['photo_original'] ?? null);
    }

    /**
     * Nomor IMEI dengan format 35-209900-176148-1 (atau null).
     */
    public function getImeiFormattedAttribute(): ?string
    {
        if (!$this->hasReportedImei()) {
            return null;
        }

        return app(\App\Services\ImeiService::class)->format($this->reported_imei);
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