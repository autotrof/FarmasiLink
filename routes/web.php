<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Client-side routing: serve the same Blade template for all routes
Route::get('/{any?}', function () {
    return Inertia::render('Welcome');
})->where('any', '.*');
