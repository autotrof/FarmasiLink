<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class LogService
{
    /**
     * Store a log entry for user action.
     */
    public function storeLog(int $userId, string $action, ?string $model = null, ?string $modelId = null, ?string $description = null): Log
     {
        return Log::create([
            'user_id' => $userId,
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get paginated logs for authenticated user.
     */
    public function getMyLogs(int $userId, int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
     {
        $query = Log::where('user_id', $userId);

        if (isset($filters['action'])) {
            $query->where('action', 'like', '%' . $filters['action'] . '%');
        }

        if (isset($filters['model'])) {
            $query->where('model', 'like', '%' . $filters['model'] . '%');
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get paginated logs for all users (admin only).
     */
    public function getAllLogs(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Log::query();

        if (isset($filters['action'])) {
            $query->where('action', 'like', '%' . $filters['action'] . '%');
        }

        if (isset($filters['model'])) {
            $query->where('model', 'like', '%' . $filters['model'] . '%');
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }
}
