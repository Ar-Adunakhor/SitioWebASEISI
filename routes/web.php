<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PublicController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::name('admin.')->group(function () {
        Route::post('committees/{committee}/members', [App\Http\Controllers\Admin\CommitteeController::class, 'addMember'])->name('committees.members.add');
        Route::delete('committees/{committee}/members/{user}', [App\Http\Controllers\Admin\CommitteeController::class, 'removeMember'])->name('committees.members.remove');
        Route::resource('committees', App\Http\Controllers\Admin\CommitteeController::class)->except(['create', 'show', 'edit']);
        Route::resource('events', App\Http\Controllers\Admin\EventController::class)->except(['create', 'show', 'edit']);
        Route::resource('counters', App\Http\Controllers\Admin\CounterController::class)->except(['create', 'show', 'edit']);
        Route::resource('team', App\Http\Controllers\Admin\TeamMemberController::class)->except(['create', 'show', 'edit']);
        Route::resource('news', App\Http\Controllers\Admin\NewsController::class)->except(['create', 'show', 'edit']);
        Route::resource('gallery', App\Http\Controllers\Admin\GalleryController::class)->except(['create', 'show', 'edit']);
        Route::resource('users', App\Http\Controllers\Admin\UserController::class)->except(['create', 'show', 'edit']);
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
