<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function __construct(private LogService $logService) {}

    /**
     * Display authenticated user's logs.
     * GET /logs/my-logs
     */
    public function myLogs(Request $request): JsonResponse
    {
    }

    /**
     * Display all users' logs (admin only).
     * GET /logs/all
     */
    public function allLogs(Request $request): JsonResponse
    {
    }
}
