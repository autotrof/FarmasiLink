<?php

namespace App\Services;

use App\Models\Prescription;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class PrescriptionService
{
    /**
     * Get paginated list of prescriptions.
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
                        $q->where('name', 'like', '%' . $filters['patient_name'] . '%');
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
        $prescription->update($data);
        $total = 0;
        // delete if not exists in new data, update if exists, create if new
        $currentItemIds = $prescription->items->pluck('id')->toArray();
        $newItemIds = collect($data['items'])->pluck('id')->filter()->toArray();
        $toDelete = array_diff($currentItemIds, $newItemIds);
        $prescription->items()->whereIn('id', $toDelete)->delete();
        // // create new items
        // $toCreate = collect($data['items'])->filter(function ($item) {
        //     return !isset($item['id']);
        // });
        // foreach ($toCreate as $itemData) {
        //     $prescription->items()->create($itemData);
        // }
        // // update existing items
        // $toUpdate = collect($data['items'])->filter(function ($item) {
        //     return isset($item['id']);
        // });
        // $medicineWithCurrentPrices =
        foreach ($data['items'] as $itemData) {
            $prescription->items()->updateOrCreate(
                ['medicine_id' => $itemData['medicine_id']],
                $itemData
            );
            $total += $itemData['quantity'] * $itemData['unit_price'];
        }

        DB::commit();
        return $prescription;
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
