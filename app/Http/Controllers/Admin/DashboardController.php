<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Committee;
use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => User::count(),
                'events' => Event::count(),
                'committees' => Committee::count(),
                'news' => News::count(),
            ],
            'upcomingEvents' => Event::orderBy('event_date')->limit(5)->get()
        ]);
    }
}
