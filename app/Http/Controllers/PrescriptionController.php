<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Services\PrescriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function __construct(private PrescriptionService $prescriptionService) {}

    /**
     * Display a listing of prescriptions.
     * GET /prescriptions
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'filters' => 'nullable|array',
            'filters.patient_id' => 'string|exists:patients,id',
            'filters.examination_id' => 'string|exists:examinations,id',
            'filters.patient_name' => 'string|max:255',
            'filters.date_from' => 'date',
            'filters.date_to' => 'date|after_or_equal:filters.date_from',
            'filters.served_by' => 'string|exists:users,id',
            'filters.status' => 'in:pending,served',
        ]);
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $filters = $request->input('filters', []);
        $prescriptions = $this->prescriptionService->getPrescriptions($perPage, $page, $filters);
        return response()->json($prescriptions);
    }

    /**
     * Store a newly created prescription.
     * POST /prescriptions
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'examination_id' => 'required|string|exists:examinations,id',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|string|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.dosage' => 'required|string|max:255',
            'items.*.instruction' => 'nullable|string|max:500',
        ]);
        $prescription = $this->prescriptionService->createPrescription($data);
        return response()->json($prescription, 201);
    }

    /**
     * Display the specified prescription.
     * GET /prescriptions/{prescription}
     */
    public function show(Prescription $prescription): JsonResponse
    {
        $data = $this->prescriptionService->getPrescriptionById($prescription->id);
        return response()->json($data);
    }

    /**
     * Update the specified prescription.
     * PUT/PATCH /prescriptions/{prescription}
     */
    public function update(Request $request, Prescription $prescription): JsonResponse
    {
        $data = $request->validate([
            'examination_id' => 'sometimes|string|exists:examinations,id',
            'items' => 'sometimes|array|min:1',
            'items.*.medicine_id' => 'required_with:items|string|exists:medicines,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.dosage' => 'required_with:items|string|max:255',
            'items.*.instruction' => 'nullable|string|max:500',
        ]);
        $updated = $this->prescriptionService->updatePrescription($prescription->id, $data);
        return response()->json($updated);
    }

    /**
     * Approve prescription (apoteker receives prescription).
     * POST /prescriptions/{prescription}/approve
     */
    public function approve(Request $request, Prescription $prescription): JsonResponse
    {
        $this->prescriptionService->servePrescription($prescription->id, $request->user()->id);
        return response()->json(['message' => 'Prescription approved successfully']);
    }
}
