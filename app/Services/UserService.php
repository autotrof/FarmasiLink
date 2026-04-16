<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class UserService
{
    /**
     * Get paginated list of users.
     */
    public function getUsers(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = User::query();

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['search'])) {
            $query->where(function(Builder $query) use ($filters) {
                $query->where('name', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('username', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user by ID.
     */
    public function getUserById(int $userId): User
    {
        return User::findOrFail($userId);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $data): User
    {
        return User::create($data);
    }

    /**
     * Update existing user.
     */
    public function updateUser(int $userId, array $data): User
    {
        $user = User::findOrFail($userId);
        $user->update($data);
        return $user;
    }

    /**
     * Delete user.
     */
    public function deleteUser(int $userId): bool
    {
        User::where('id', $userId)->delete();
        return true;
    }

    /**
     * Reset password for a user (generate new password).
     */
    public function resetUserPassword(int $userId): string
    {
        $newPassword = Str::random(8);
        $user = User::findOrFail($userId);
        $user->password = $newPassword;
        $user->save();
        return $newPassword;
    }
}
