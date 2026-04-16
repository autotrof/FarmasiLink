<?php

namespace App\Http\Controllers;

use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProfileController extends Controller
{
    public function __construct(private ProfileService $profileService) {}

    /**
     * Display profile settings page.
     * GET /profile
     */
    public function index(): InertiaResponse
    {
        $profile = $this->profileService->getAuthenticatedUser();

        return Inertia::render('Profile', [
            'profile' => [
                'id' => $profile->id,
                'name' => $profile->name,
                'username' => $profile->username,
                'email' => $profile->email,
                'role' => $profile->role,
            ],
        ]);
    }

    /**
     * Get authenticated user as JSON.
     * GET /profile/me
     */
    public function show(): JsonResponse
    {
        $profile = $this->profileService->getAuthenticatedUser();

        return response()->json([
            'user' => [
                'id' => $profile->id,
                'name' => $profile->name,
                'username' => $profile->username,
                'email' => $profile->email,
                'role' => $profile->role,
            ],
        ]);
    }

    /**
     * Update authenticated user's password.
     * PUT /profile/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (! $this->profileService->changePassword(Auth::id(), $data['current_password'], $data['new_password'])) {
            return response()->json(
                ['message' => 'Password saat ini tidak sesuai'],
                422
            );
        }

        return response()->json(['message' => 'Password berhasil diperbarui']);
    }
}
