<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportFollowup extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'action',
        'document_no',
        'recipient_name',
        'recipient_org',
        'recipient_contact',
        'recipient_id_number',
        'witness_name',
        'witness_name_2',
        'witness_phone',
        'note',
        'photo',
        'created_by',
        'executed_at',
    ];

    protected $casts = [
        'executed_at' => 'datetime',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getActionLabelAttribute(): string
    {
        return \App\Services\ClaimWindowService::ACTION_LABELS[$this->action] ?? $this->action;
    }

    /**
     * Daftar witnesses yang tercatat.
     */
    public function witnesses(): array
    {
        return array_values(array_filter([
            $this->witness_name,
            $this->witness_name_2,
        ]));
    }

    /**
     * URL foto bukti berita acara.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? '/storage/' . $this->photo : null;
    }
}
