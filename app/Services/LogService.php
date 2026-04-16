<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

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
            'model_id' => is_numeric((string) $modelId) ? (int) $modelId : null,
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
        $query = Log::with(['user:id,name,username'])->where('user_id', $userId);
        $query = $this->applyDateFilters($query, $filters);

        return $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get paginated logs for all users (admin only).
     */
    public function getAllLogs(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Log::query();

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        $query = $this->applyDateFilters($query, $filters);

        return $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Apply common date range filters.
     *
     * @param  Builder<Log>  $query
     * @param  array<string, mixed>  $filters
     * @return Builder<Log>
     */
    private function applyDateFilters(Builder $query, array $filters): Builder
    {
        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query;
    }
}
