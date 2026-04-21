<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'emoji',
        'event_date',
        'location',
        'capacity',
        'duration',
        'status',
        'gradient',
        'image_url',
        'sort_order',
        'visible',
    ];
}
