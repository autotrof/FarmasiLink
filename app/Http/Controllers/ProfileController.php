<?php

namespace App\Http\Controllers;

use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function __construct(private ProfileService $profileService) {}

    /**
     * Display authenticated user's profile.
     * GET /profile
     */
    public function show(): JsonResponse
    {
        $profile = $this->profileService->getAuthenticatedUser();
        return response()->json($profile);
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

        $this->profileService->changePassword(Auth::id(), $data['current_password'], $data['new_password']);
        return response()->json(['message' => 'Password updated successfully']);
    }
}
