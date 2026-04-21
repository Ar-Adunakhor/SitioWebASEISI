<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $fillable = [
        'full_name',
        'role_title',
        'description',
        'avatar_emoji',
        'image_url',
        'linkedin',
        'github',
        'instagram',
        'sort_order',
        'visible',
    ];
}
