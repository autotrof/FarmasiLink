<?php

namespace App\Services;

use App\Models\Patient;
use Illuminate\Pagination\LengthAwarePaginator;

class PatientService
{
    /**
     * Get paginated list of patients.
     */
    public function getPatients(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Patient::query();
        if (isset($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }
        if (isset($filters['patient_number'])) {
            $query->where('patient_number', 'like', '%' . $filters['patient_number'] . '%');
        }
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get patient by ID with medical history.
     */
    public function getPatientById(string $patientId): Patient
    {
        return Patient::findOrFail($patientId);
    }

    /**
     * Create a new patient.
     */
    public function createPatient(array $data): Patient
    {
        return Patient::create($data);
    }

    /**
     * Update existing patient.
     */
    public function updatePatient(string $patientId, array $data): Patient
    {
        $patient = Patient::findOrFail($patientId);
        $patient->update($data);
        return $patient;
    }

    /**
     * Delete patient.
     */
    public function deletePatient(string $patientId): bool
    {
        $patient = Patient::findOrFail($patientId);
        return $patient->delete();
    }
}
