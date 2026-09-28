<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchResult extends Model
{
    protected $fillable = [
        'report_id_1',
        'report_id_2',
        'photo_score',
        'text_score',
        'final_score',
        'label',
    ];
}