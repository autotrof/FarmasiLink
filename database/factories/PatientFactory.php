<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['male', 'female']);

        return [
            'id' => Str::uuid(),
            'patient_number' => fake()->unique()->numerify('PAT-######'),
            'name' => fake('id_ID')->name($gender),
            'date_of_birth' => fake()->dateTimeBetween('-60 years', '-2 years')->format('Y-m-d'),
            'gender' => $gender,
            'phone' => fake('id_ID')->phoneNumber(),
            'address' => fake('id_ID')->address(),
            'medical_history' => fake()->paragraph(),
        ];
    }
}
