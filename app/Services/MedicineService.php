<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\Price;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class MedicineService
{
    private string $baseUrl = 'https://recruitment.rsdeltasurya.com/api/v1';
    private string $email;
    private string $password;

    public function __construct()
    {
        $this->email = config('services.medicine.email');
        $this->password = config('services.medicine.password');
    }

    /**
     * Fetch all medicines and their prices from external API
     */
    public function fetchAndSyncMedicines(?callable $callback = null): void
    {
        $token = $this->authenticate();

        if (! $token) {
            throw new \Exception('Failed to authenticate with medicine API');
        }

        $medicines = $this->getMedicines($token);

        foreach ($medicines as $medicineData) {
            if ($callback) {
                $callback("Processing medicine: {$medicineData['name']}");
            }

            $medicine = Medicine::updateOrCreate(
                ['id' => $medicineData['id']],
                ['name' => $medicineData['name']]
            );

            $this->fetchAndSyncPrices($medicine, $token, $callback);

            // Add 2-second delay between each medicine fetch to avoid API rate limiting
            sleep(2);
        }
    }

    /**
     * Authenticate and get access token
     */
    private function authenticate(): ?string
    {
        $response = Http::post("{$this->baseUrl}/auth", [
            'email' => $this->email,
            'password' => $this->password,
        ]);

        if ($response->successful()) {
            return $response->json('access_token');
        }

        return null;
    }

    /**
     * Get all medicines from API
     */
    private function getMedicines(string $token): array
    {
        $response = Http::withToken($token)->get("{$this->baseUrl}/medicines");

        if ($response->successful()) {
            return $response->json('medicines', []);
        }

        return [];
    }

    /**
     * Fetch and sync prices for a specific medicine
     */
    private function fetchAndSyncPrices(Medicine $medicine, string $token, ?callable $callback = null): void
    {
        $response = Http::withToken($token)
            ->get("{$this->baseUrl}/medicines/{$medicine->id}/prices");

        if (! $response->successful()) {
            return;
        }

        $prices = $response->json('prices', []);

        foreach ($prices as $priceData) {
            if ($callback) {
                $endDate = $priceData['end_date']['value'] ?? 'ongoing';
                $callback("  - Price: {$priceData['unit_price']} ({$priceData['start_date']['value']} - {$endDate})");
            }

            Price::updateOrCreate(
                ['id' => $priceData['id']],
                [
                    'medicine_id' => $medicine->id,
                    'unit_price' => $priceData['unit_price'],
                    'start_date' => $priceData['start_date']['value'],
                    'end_date' => $priceData['end_date']['value'] ?? null,
                ]
            );
        }
    }

    /**
     * Get medicines with their current prices.
     * Current price is determined by the most recent price record where end_date is null or in the future.
     * @return LengthAwarePaginator<Medicine>
     */
    public function getMedicinesWithCurrentPrices(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $currentPrices = Price::select([
            'medicine_id',
            'unit_price'
        ])
        ->where(function (Builder $query) {
            $query->whereNull('end_date')
            ->orWhere(function (Builder $query) {
                $query->where('start_date', '<=', date('Y-m-d'))
                      ->where('end_date', '>=', date('Y-m-d'));
            });
        })
        ->groupBy('medicine_id');

        $medicines = Medicine::leftJoinSub($currentPrices, 'current_prices', function ($join) {
            $join->on('medicines.id', '=', 'current_prices.medicine_id');
        })
        ->select('medicines.*', 'current_prices.unit_price');
        if (isset($filters['search'])) {
            $medicines->where('medicines.name', 'like', '%' . $filters['search'] . '%');
        }
        $medicines = $medicines->orderBy('medicines.name')
        ->paginate($perPage, ['*'], 'page', $page);

        return $medicines;
    }

    public function getMedicineById(string $medicineId): Medicine
    {
        return Medicine::with(['prices' => function ($query) {
            $query->orderBy('start_date', 'desc');
        }])->findOrFail($medicineId);
    }
}
