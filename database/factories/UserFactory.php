<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'username' => fake()->unique()->username(),
            'name' => fake()->name(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => UserRole::Apoteker,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Admin,
        ]);
    }

    /**
     * Create a dokter user.
     */
    public function dokter(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Dokter,
        ]);
    }

    /**
     * Create a resepsionis user.
     */
    public function resepsionis(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Resepsionis,
        ]);
    }

    /**
     * Create an apoteker user.
     */
    public function apoteker(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Apoteker,
        ]);
    }
}
