<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    /**
     * Display a listing of users.
     * GET /users
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'filters' => 'nullable|array',
            'filters.search' => 'string|max:255',
            'filters.role' => 'in:'.implode(',', array_column(UserRole::cases(), 'value')),
        ]);
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $filters = $request->input('filters', []);
        $users = $this->userService->getUsers($perPage, $page, $filters);
        return response()->json($users);
    }

    /**
     * Store a newly created user.
     * POST /users
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:'.implode(',', array_column(UserRole::cases(), 'value')),
        ]);
        $user = $this->userService->createUser($data);
        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     * GET /users/{user}
     */
    public function show(User $user): JsonResponse
    {
        $data = $this->userService->getUserById($user->id);
        return response()->json($data);
    }

    /**
     * Update the specified user.
     * PUT/PATCH /users/{user}
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $user->id,
            'password' => 'sometimes|required|string|min:8|confirmed',
            'role' => 'sometimes|required|in:'.implode(',', array_column(UserRole::cases(), 'value')),
        ]);
        $updatedUser = $this->userService->updateUser($user->id, $data);
        return response()->json($updatedUser);
    }

    /**
     * Delete the specified user.
     * DELETE /users/{user}
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userService->deleteUser($user->id);
        return response()->json(null, 204);
    }

    /**
     * Reset password for a user.
     * POST /users/{user}/reset-password
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $newPassword = $this->userService->resetUserPassword($user->id);
        return response()->json(['new_password' => $newPassword]);
    }
}
