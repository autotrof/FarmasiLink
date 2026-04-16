<?php

namespace Database\Seeders;

use App\Console\Commands\FetchMedicines;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->admin()->create([
            'username' => 'admin',
            'name' => 'Admin',
        ]);

        // Create sample dokter
        User::factory()->dokter()->create([
            'username' => 'dokter',
            'name' => 'Dr. Budi',
        ]);

        // Create sample apoteker
        User::factory()->apoteker()->create([
            'username' => 'apoteker',
            'name' => 'Apt. Siti',
        ]);

        // Create additional sample users
        User::factory(5)->create();

        // Seed patients
        $this->call(PatientSeeder::class);

        // Seed examinations
        $this->call(ExaminationSeeder::class);

        // fetch all medicines from api
        Artisan::call(FetchMedicines::class);

        // Seed prescriptions
        $this->call(PrescriptionSeeder::class);
    }
}
