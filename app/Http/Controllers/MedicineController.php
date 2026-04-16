<?php

namespace App\Http\Controllers;

use App\Console\Commands\FetchMedicines;
use App\Models\Medicine;
use App\Services\MedicineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MedicineController extends Controller
{
    public function __construct(private MedicineService $medicineService) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('Medicines');
    }

    /**
     * Display a listing of medicines.
     * GET /medicines/list
     */
    public function list(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'filters' => 'nullable|array',
            'filters.search' => 'nullable|string',
        ]);
        $medicines = $this->medicineService->getMedicinesWithCurrentPrices(
            perPage: $request->query('per_page', 15),
            page: $request->query('page', 1),
            filters: $request->input('filters', [])
        );

        return response()->json($medicines);
    }

    /**
     * Display the specified medicine.
     * GET /medicines/{medicine}
     */
    public function show(Medicine $medicine): JsonResponse
    {
        $data = $this->medicineService->getMedicinesWithCurrentPrices($medicine->id);

        return response()->json($data);
    }

    /**
     * Refresh medicines from external API.
     * POST /medicines/refresh
     */
    public function refresh(): JsonResponse
    {
        Artisan::call(FetchMedicines::class);

        return response()->json(['message' => 'Medicine data refresh initiated.']);
    }

    /**
     * Get price history for a specific medicine.
     * GET /medicines/{medicine}/price-history
     */
    public function priceHistory(Medicine $medicine): JsonResponse
    {
        $data = $this->medicineService->getPriceHistory($medicine->id);

        return response()->json($data);
    }
}
