<?php

namespace Database\Factories;

use App\Models\Examination;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Examination>
 */
class ExaminationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dokterIds = User::where('role', 'dokter')->inRandomOrder()->limit(5)->pluck('id')->toArray();
        $patientIds = Patient::limit(50)->inRandomOrder()->pluck('id')->toArray();

        return [
            'id' => Str::uuid(),
            'patient_id' => fake()->randomElement($patientIds),
            'doctor_id' => fake()->randomElement($dokterIds),
            'examination_date' => fake()->dateTimeThisYear(),
            'findings' => fake('id_ID')->paragraph(),
            'document_path' => null,
            'height' => fake()->numberBetween(150, 200),
            'weight' => fake()->numberBetween(40, 120),
            'systole' => fake()->numberBetween(100, 140),
            'diastole' => fake()->numberBetween(60, 90),
            'heart_rate' => fake()->numberBetween(60, 100),
            'respiration_rate' => fake()->numberBetween(12, 20),
            'temperature' => fake()->randomFloat(1, 36, 39),
        ];
    }
}
