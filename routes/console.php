<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule medicine data fetch - runs daily at 2 AM
Schedule::command('app:fetch-medicines')
    ->dailyAt('02:00')
    ->onOneServer();
