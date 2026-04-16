<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Examination;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'served']);

        return [
            'id' => Str::uuid(),
            'examination_id' => Examination::inRandomOrder()->first()?->id ?? Examination::factory(),
            'status' => $status,
            'served_date' => $status === 'served' ? fake()->dateTimeThisMonth() : null,
            'served_by' => $status === 'served' ? User::where('role', UserRole::Apoteker->value)->inRandomOrder()->first()?->id : null,
            'total' => 0,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'served_date' => null,
            'served_by' => null,
        ]);
    }

    public function served(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'served',
            'served_date' => fake()->dateTimeThisMonth(),
            'served_by' => User::where('role', UserRole::Apoteker->value)->inRandomOrder()->first()?->id,
        ]);
    }
}
