<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Services\LogService;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(
        private PatientService $patientService,
        private LogService $logService
    ) {}

    /**
     * Display the patients page.
     * GET /patients
     */
    public function index(): Response
    {
        return Inertia::render('Patient');
    }

    /**
     * Get paginated list of patients.
     * GET /patients/list
     */
    public function list(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $filters = $request->only(['name', 'patient_number']);
        $patients = $this->patientService->getPatients($perPage, $page, $filters);

        return response()->json($patients);
    }

    /**
     * Store a newly created patient.
     * POST /patients
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'medical_history' => 'nullable|string',
        ]);

        $patient = $this->patientService->createPatient($data);
        $this->logService->storeLog(
            userId: (int) $request->user()->id,
            action: 'create',
            model: 'Patient',
            description: "Membuat pasien: {$patient->name} ({$patient->id})"
        );

        return response()->json($patient, 201);
    }

    /**
     * Display the specified patient.
     * GET /patients/{patient}
     */
    public function show(Patient $patient): JsonResponse
    {
        $data = $this->patientService->getPatientById($patient->id);

        return response()->json($data);
    }

    /**
     * Update the specified patient.
     * PUT/PATCH /patients/{patient}
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $data = $request->validate([
            'patient_number' => 'sometimes|required|string|unique:patients,patient_number,'.$patient->id,
            'name' => 'sometimes|required|string',
            'date_of_birth' => 'sometimes|required|date',
            'gender' => 'sometimes|required|in:male,female',
            'phone' => 'sometimes|nullable|string',
            'address' => 'sometimes|nullable|string',
            'medical_history' => 'sometimes|nullable|string',
        ]);

        $updated = $this->patientService->updatePatient($patient->id, $data);
        $this->logService->storeLog(
            userId: (int) $request->user()->id,
            action: 'update',
            model: 'Patient',
            description: "Mengubah pasien: {$updated->name} ({$updated->id})"
        );

        return response()->json($updated);
    }

    /**
     * Delete the specified patient.
     * DELETE /patients/{patient}
     */
    public function destroy(Request $request, Patient $patient): JsonResponse
    {
        $deletedPatientId = $patient->id;
        $deletedPatientName = $patient->name;

        $this->patientService->deletePatient($patient->id);
        $this->logService->storeLog(
            userId: (int) $request->user()->id,
            action: 'delete',
            model: 'Patient',
            description: "Menghapus pasien: {$deletedPatientName} ({$deletedPatientId})"
        );

        return response()->json(null, 204);
    }
}
