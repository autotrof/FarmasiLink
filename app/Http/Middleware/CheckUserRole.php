<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user has one of the required roles
        if (! $this->hasRole($request->user(), $roles)) {
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }

    /**
     * Check if user has one of the required roles.
     *
     * @param  User  $user
     * @param  array<string>  $roles
     */
    private function hasRole(User $user, array $roles): bool
    {
        foreach ($roles as $role) {
            if ($user->role->value === $role) {
                return true;
            }
        }

        return false;
    }
}
