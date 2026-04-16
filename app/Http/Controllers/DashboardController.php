<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    /**
     * Show admin dashboard page with statistics.
     */
    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('Dashboard');
    }

    public function getStats(Request $request): JsonResponse
    {
        // Get month and year from query params, default to current month/year
        $month = (int) $request->query('month', Carbon::now()->month);
        $year = (int) $request->query('year', Carbon::now()->year);

        // Validate month is between 1-12
        if ($month < 1 || $month > 12) {
            $month = Carbon::now()->month;
        }

        // Get dashboard statistics
        $stats = $this->dashboardService->getDashboardStats($month, $year);
        return response()->json($stats);
    }
}
