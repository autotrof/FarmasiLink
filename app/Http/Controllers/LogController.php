<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class LogController extends Controller
{
    public function __construct(private LogService $logService) {}

    /**
     * Display activity log page.
     * GET /my-logs
     */
    public function myLogs(Request $request): InertiaResponse
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        return Inertia::render('Logs', [
            'isAdmin' => $isAdmin,
            'users' => $isAdmin
                ? User::query()->select('id', 'name', 'username')->orderBy('name')->get()
                : [],
        ]);
    }

    /**
     * Get activity logs as JSON.
     * GET /my-logs/list
     */
    public function list(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $filters = [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'user_id' => $validated['user_id'] ?? null,
        ];
        $perPage = (int) ($validated['per_page'] ?? 15);
        $page = (int) ($validated['page'] ?? 1);
        $user = $request->user();

        $logs = $user->isAdmin()
            ? $this->logService->getAllLogs($perPage, $page, $filters)
            : $this->logService->getMyLogs((int) $user->id, $perPage, $page, $filters);

        return response()->json($logs);
    }

    /**
     * Admin alias route for activity log page.
     * GET /all-logs
     */
    public function allLogs(Request $request): InertiaResponse
    {
        return $this->myLogs($request);
    }
}
