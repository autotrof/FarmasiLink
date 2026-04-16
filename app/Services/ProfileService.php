<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProfileService
{
    /**
     * Get authenticated user's profile.
     */
    public function getAuthenticatedUser(): User
    {
        return Auth::user();
    }

    /**
     * Change password for authenticated user.
     */
    public function changePassword(int $userId, string $oldPassword, string $newPassword): bool
    {
        $user = User::findOrFail($userId);

        if (!password_verify($oldPassword, $user->password)) {
            return false; // Old password does not match
        }

        $user->password = $newPassword;
        $user->save();

        return true;
    }
}
