<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'claimant_id',
        'owner_id',
        'status',
        'message',
        'admin_note',
        'verified_at',
        'verified_by',
        'lost_report_id',
        'claimant_proof',
        'claimant_serial',
        'handed_over_at',
        'handed_over_by',
        'receiver_name',
        'receiver_id_type',
        'handover_note',
        'is_redemption',
        'redeemed_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'handed_over_at' => 'datetime',
        'redeemed_at' => 'datetime',
        'is_redemption' => 'boolean',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function claimant()
    {
        return $this->belongsTo(User::class, 'claimant_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function lostReport()
    {
        return $this->belongsTo(Report::class, 'lost_report_id');
    }

    public function handedOverBy()
    {
        return $this->belongsTo(User::class, 'handed_over_by');
    }
}