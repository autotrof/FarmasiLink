<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\Prescription;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PrescriptionService
{
    /**
     * Get paginated list of prescriptions.
     *
     * @return LengthAwarePaginator<Prescription>
     */
    public function getPrescriptions(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Prescription::query();
        if (isset($filters['patient_id']) || isset($filters['examination_id']) || isset($filters['patient_name'])) {
            $query->whereHas('examination', function ($q) use ($filters) {
                if (isset($filters['patient_id'])) {
                    $q->where('patient_id', $filters['patient_id']);
                }
                if (isset($filters['examination_id'])) {
                    $q->where('id', $filters['examination_id']);
                }
                if (isset($filters['patient_name'])) {
                    $q->whereHas('patient', function ($q) use ($filters) {
                        $q->where('name', 'like', '%'.$filters['patient_name'].'%');
                    });
                }
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('served_date', '>=', $filters['date_from']);
        }
        if (isset($filters['date_to'])) {
            $query->whereDate('served_date', '<=', $filters['date_to']);
        }
        if (isset($filters['served_by'])) {
            $query->where('served_by', $filters['served_by']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get prescription by ID with prescription items.
     */
    public function getPrescriptionById(string $prescriptionId): Prescription
    {
        return Prescription::with('items')->findOrFail($prescriptionId);
    }

    /**
     * Create a new prescription with items.
     */
    public function createPrescription(array $data): Prescription
    {
        DB::beginTransaction();

        // Calculate total from items and fetch current prices
        $total = 0;
        foreach ($data['items'] as &$itemData) {
            $price = $this->getCurrentMedicinePrice($itemData['medicine_id']);
            $itemData['unit_price'] = $price;
            $total += $itemData['quantity'] * $price;
        }
        unset($itemData);

        $data['total'] = $total;

        /** @var Prescription $prescription */
        $prescription = Prescription::create($data);
        foreach ($data['items'] as $itemData) {
            $prescription->items()->create($itemData);
        }
        DB::commit();

        return $prescription;
    }

    /**
     * Update existing prescription (only if status is pending).
     */
    public function updatePrescription(string $prescriptionId, array $data): Prescription
    {
        $prescription = Prescription::with('items')->findOrFail($prescriptionId);
        if ($prescription->isServed()) {
            throw new \Exception('Cannot update a served prescription');
        }
        DB::beginTransaction();

        // Get medicine IDs from incoming data
        $incomingMedicineIds = collect($data['items'])->pluck('medicine_id')->toArray();

        // Delete items not in incoming data
        $prescription->items()
            ->whereNotIn('medicine_id', $incomingMedicineIds)
            ->delete();

        // Calculate total and prepare items with current prices
        $total = 0;
        foreach ($data['items'] as &$itemData) {
            $price = $this->getCurrentMedicinePrice($itemData['medicine_id']);
            $itemData['unit_price'] = $price;
            $total += $itemData['quantity'] * $price;
        }
        unset($itemData);

        $data['total'] = $total;
        $prescription->update($data);

        // Update or create items
        foreach ($data['items'] as $itemData) {
            $prescription->items()->updateOrCreate(
                ['medicine_id' => $itemData['medicine_id']],
                $itemData
            );
        }

        DB::commit();

        return $prescription;
    }

    /**
     * Get current price for a medicine.
     * Returns price that is active on current date, or the latest price.
     */
    private function getCurrentMedicinePrice(string $medicineId): float
    {
        $today = Carbon::today();

        // Try to find active price for today
        $activePrice = Medicine::find($medicineId)
            ->prices()
            ->where(function ($query) use ($today) {
                $query->where('start_date', '<=', $today)
                    ->where(function ($q) use ($today) {
                        $q->where('end_date', '>=', $today)
                            ->orWhereNull('end_date');
                    });
            })
            ->latest('start_date')
            ->first();

        if ($activePrice) {
            return (float) $activePrice->unit_price;
        }

        // Fallback to latest price
        $latestPrice = Medicine::find($medicineId)
            ->prices()
            ->latest('start_date')
            ->first();

        return (float) ($latestPrice?->unit_price ?? 0);
    }

    /**
     * Serve prescription (apoteker receives and marks as completed).
     */
    public function servePrescription(string $prescriptionId, array $data): bool
    {
        $prescription = Prescription::findOrFail($prescriptionId);
        if ($prescription->isServed()) {
            throw new \Exception('Prescription is already served');
        }
        $prescription->update([
            'status' => 'served',
            'served_date' => now(),
            'served_by' => $data['served_by'] ?? null,
        ]);

        return true;
    }
}
