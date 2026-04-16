<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AuthController extends Controller
{
    public function __construct(private LogService $logService) {}

    /**
     * Show login page.
     */
    public function showLogin(): InertiaResponse
    {
        return Inertia::render('Login');
    }

    /**
     * Handle login request.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (Auth::attempt(['username' => $credentials['username'], 'password' => $credentials['password']])) {
            $request->session()->regenerate();
            $user = $request->user();

            $this->logService->storeLog(
                userId: (int) $user->id,
                action: 'login',
                model: 'User',
                modelId: (string) $user->id,
                description: "User login: {$user->username}"
            );

            return response()->json($user);
        }

        throw ValidationException::withMessages([
            'username' => ['Username atau password salah.'],
        ]);
    }

    /**
     * Handle logout request.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $this->logService->storeLog(
                userId: (int) $user->id,
                action: 'logout',
                model: 'User',
                modelId: (string) $user->id,
                description: "User logout: {$user->username}"
            );
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(true);
    }
}
