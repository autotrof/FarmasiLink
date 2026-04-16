<?php

namespace App\Services;

use App\Models\Examination;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ExaminationService
{
    /**
     * Get paginated list of examinations.
     */
    public function getExaminations(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Examination::with([
            'patient',
            'doctor',
            'prescription',
        ]);
        if (isset($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }
        if (isset($filters['date_from'])) {
            $query->whereDate('examination_date', '>=', $filters['date_from']);
        }
        if (isset($filters['date_to'])) {
            $query->whereDate('examination_date', '<=', $filters['date_to']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['doctor_id'])) {
            $query->where('doctor_id', $filters['doctor_id']);
        }
        // Search by findings, doctor name, or patient name
        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('doctor', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%$search%");
                })
                    ->orWhereHas('patient', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%$search%");
                    });
            });
        }
        // Date range filter
        if (! empty($filters['date_from'])) {
            $query->whereDate('examination_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('examination_date', '<=', $filters['date_to']);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get examination by ID with vital signs and prescription.
     */
    public function getExaminationById(string $examinationId): Examination
    {
        return Examination::findOrFail($examinationId);
    }

    /**
     * Create a new examination with vital signs.
     */
    public function createExamination(array $data): Examination
    {
        $data['id'] = Str::uuid()->toString();

        return Examination::create($data);
    }

    /**
     * Update existing examination.
     */
    public function updateExamination(string $examinationId, array $data): Examination
    {
        $examination = Examination::findOrFail($examinationId);
        $examination->update($data);

        return $examination;
    }

    /**
     * Delete examination.
     */
    public function deleteExamination(string $examinationId): bool
    {
        $examination = Examination::findOrFail($examinationId);

        return $examination->delete();
    }

    /**
     * Upload medical document for examination.
     */
    public function uploadDocument(string $examinationId, $file): string
    {
        $examination = Examination::findOrFail($examinationId);
        $path = tap($file->store('examination_documents/'.$examinationId, 'public'), function ($path) use ($examination) {
            $examination->update(['document_path' => $path]);
        });

        return $path;
    }
}
