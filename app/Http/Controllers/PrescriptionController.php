<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Services\PrescriptionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function __construct(private PrescriptionService $prescriptionService) {}

    /**
     * Display a listing of prescriptions.
     * GET /prescriptions
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Prescription');
    }

    /**
     * Get paginated JSON list of prescriptions.
     * GET /prescriptions/list
     */
    public function list(Request $request): JsonResponse
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
            'filters.served_by' => 'integer|exists:users,id',
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
        $this->prescriptionService->servePrescription($prescription->id, ['served_by' => $request->user()->id]);

        return response()->json(['message' => 'Prescription approved successfully']);
    }

    /**
     * Print receipt for the prescription.
     * GET /prescriptions/{prescription}/print
     */
    public function printReceipt(Prescription $prescription)
    {
        $prescriptionData = $this->prescriptionService->getPrescriptionById($prescription->id);

        $pdf = Pdf::loadView('pdf.receipt', ['prescription' => $prescriptionData]);

        // Custom paper size for small receipt (e.g. 80mm width)
        // 80mm is ~226.77 pt.
        $pdf->setPaper([0, 0, 226, 600]);

        return $pdf->stream("resi-resep-{$prescription->id}.pdf");
    }
}
