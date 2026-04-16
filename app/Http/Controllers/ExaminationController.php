<?php

namespace App\Http\Controllers;

use App\Models\Examination;
use App\Services\ExaminationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExaminationController extends Controller
{
    public function __construct(private ExaminationService $examinationService) {}

    /**
     * Display the examinations page.
     * GET /examinations
     */
    public function index(): Response
    {
        return Inertia::render('Examinations');
    }

    /**
     * Get paginated list of examinations.
     * GET /examinations/list
     */
    public function list(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'filters' => 'nullable|array',
            'filters.search' => 'nullable|string',
            'filters.patient_id' => 'nullable|string',
            'filters.date_from' => 'nullable|date',
            'filters.date_to' => 'nullable|date',
        ]);
        $examinations = $this->examinationService->getExaminations(
            perPage: $request->query('per_page', 15),
            page: $request->query('page', 1),
            filters: $request->input('filters', [])
        );

        return response()->json($examinations);
    }

    /**
     * Store a newly created examination.
     * POST /examinations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'examination_date' => 'required|date',
            'findings' => 'required|string',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'systole' => 'nullable|numeric',
            'diastole' => 'nullable|numeric',
            'heart_rate' => 'nullable|numeric',
            'respiration_rate' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $validated['doctor_id'] = auth()->id();

        $document = $request->file('document');
        unset($validated['document']);

        $examination = $this->examinationService->createExamination($validated);

        if ($document) {
            $this->examinationService->uploadDocument($examination->id, $document);
        }

        return response()->json($examination, 201);
    }

    /**
     * Display the specified examination.
     * GET /examinations/{examination}
     */
    public function show(Examination $examination): JsonResponse
    {
        $data = $this->examinationService->getExaminationById($examination->id);

        return response()->json($data);
    }

    /**
     * Update the specified examination.
     * PUT/PATCH /examinations/{examination}
     */
    public function update(Request $request, Examination $examination): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'examination_date' => 'required|date',
            'findings' => 'required|string',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'systole' => 'nullable|numeric',
            'diastole' => 'nullable|numeric',
            'heart_rate' => 'nullable|numeric',
            'respiration_rate' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $document = $request->file('document');
        unset($validated['document']);

        $examination = $this->examinationService->updateExamination($examination->id, $validated);

        if ($document) {
            $this->examinationService->uploadDocument($examination->id, $document);
        }

        return response()->json($examination);
    }

    /**
     * Delete the specified examination.
     * DELETE /examinations/{examination}
     */
    public function destroy(Examination $examination): JsonResponse
    {
        $this->examinationService->deleteExamination($examination->id);

        return response()->json(null, 204);
    }

    /**
     * Upload medical document for examination.
     * POST /examinations/{examination}/upload-document
     */
    public function uploadDocument(Request $request, Examination $examination): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $path = $this->examinationService->uploadDocument($examination->id, $request->file('document'));

        return response()->json(['message' => 'Document uploaded successfully', 'path' => $path], 201);
    }
}
