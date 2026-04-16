<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    /**
     * Show dashboard page.
     */
    public function index(): InertiaResponse
    {
        return Inertia::render('Welcome');
    }
}
