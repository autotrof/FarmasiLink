<?php

namespace Database\Seeders;

use App\Models\Examination;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Database\Seeder;

class PrescriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all examinations
        $examinations = Examination::inRandomOrder()->limit(100)->get();

        foreach ($examinations as $examination) {
            /** @var Prescription $prescription */
            $prescription = Prescription::factory()->create([
                'examination_id' => $examination->id,
            ]);

            // Create 2-5 prescription items per prescription
            $itemCount = fake()->numberBetween(2, 5);
            PrescriptionItem::factory($itemCount)->create([
                'prescription_id' => $prescription->id,
            ]);

            // Update total for the prescription
            $total = $prescription->items()->with('medicine')->get()->sum(function ($item) {
                return $item->quantity * $item->unit_price;
            });
            $prescription->update(['total' => $total]);
        }
    }
}
