<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = [
        'caption',
        'emoji',
        'gradient',
        'image_url',
        'sort_order',
        'visible',
    ];
}
