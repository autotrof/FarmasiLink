<?php

namespace App\Services;

use App\Models\Patient;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class PatientService
{
    /**
     * Get paginated list of patients.
     */
    public function getPatients(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Patient::query();
        if (isset($filters['name'])) {
            $query->where('name', 'like', '%'.$filters['name'].'%');
        }
        if (isset($filters['patient_number'])) {
            $query->where('patient_number', 'like', '%'.$filters['patient_number'].'%');
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
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
        if (empty($data['patient_number'])) {
            do {
                $number = 'PAT-'.str_pad((string) mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
            } while (Patient::where('patient_number', $number)->exists());

            $data['patient_number'] = $number;
        }
        $data['id'] = Str::uuid();

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
