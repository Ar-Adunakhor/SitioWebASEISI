<?php

namespace App\Http\Controllers;

use App\Models\Counter;
use App\Models\Event;
use App\Models\TeamMember;
use App\Models\Committee;
use App\Models\News;
use App\Models\Gallery;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Index', [
            'counters' => Counter::orderBy('sort_order')->get(),
            'events' => Event::where('visible', true)->orderBy('sort_order')->get(),
            'team' => TeamMember::where('visible', true)->orderBy('sort_order')->get(),
            'committees' => Committee::where('visible', true)->orderBy('sort_order')->get(),
            'news' => News::where('visible', true)->orderBy('published_date', 'desc')->get(),
            'gallery' => Gallery::where('visible', true)->orderBy('sort_order')->get(),
        ]);
    }
}
