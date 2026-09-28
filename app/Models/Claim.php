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
    ];

    protected $casts = [
        'verified_at' => 'datetime',
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
}