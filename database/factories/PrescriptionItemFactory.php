<?php

namespace Database\Factories;

use App\Models\Medicine;
use App\Models\PrescriptionItem;
use App\Models\Price;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PrescriptionItem>
 */
class PrescriptionItemFactory extends Factory
{
    private ?Carbon $examinationDate = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dosages = ['1x1 tablet', '2x2 tablet', '3x1 tablet', '1x2 tablet', '2x1 kaplet', '3x1 kaplet'];
        $instructions = [
            'Diminum setelah makan',
            'Diminum sebelum makan',
            'Diminum saat perus kosong',
            'Diminum dengan air putih',
            'Diminum dengan susu',
        ];

        $medicine = Medicine::inRandomOrder()->first() ?? Medicine::factory()->create();
        $priceRecord = $this->getPriceRecordForMedicineAtDate($medicine->id);
        $unitPrice = $priceRecord?->unit_price ?? 0;
        $quantity = fake()->numberBetween(1, 10);
        $subtotal = $quantity * $unitPrice;

        return [
            'id' => Str::uuid(),
            'medicine_id' => $medicine->id,
            'price_id' => $priceRecord?->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
            'dosage' => fake()->randomElement($dosages),
            'instruction' => fake()->randomElement($instructions),
        ];
    }

    /**
     * Set examination date to fetch price accordingly.
     */
    public function withExaminationDate(Carbon $date): static
    {
        $this->examinationDate = $date;

        return $this;
    }

    /**
     * Get price record for medicine at specific date.
     */
    private function getPriceRecordForMedicineAtDate(string $medicineId): ?Price
    {
        $date = $this->examinationDate ?? Carbon::today();

        // Try to find active price for the date
        $activePrice = Price::where('medicine_id', $medicineId)
            ->where(function ($query) use ($date) {
                $query->where('start_date', '<=', $date)
                    ->where(function ($q) use ($date) {
                        $q->where('end_date', '>=', $date)
                            ->orWhereNull('end_date');
                    });
            })
            ->latest('start_date')
            ->first();

        if ($activePrice) {
            return $activePrice;
        }

        // Fallback to latest price
        return Price::where('medicine_id', $medicineId)
            ->latest('start_date')
            ->first();
    }
}
