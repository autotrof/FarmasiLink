<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreExaminationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->isDokter();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'examination_date' => ['required', 'date_format:Y-m-d H:i:s'],
            'findings' => ['required', 'string', 'max:5000'],
            'document_path' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,png', 'max:10240'],
            'vital_signs' => ['required', 'array'],
            'vital_signs.height' => ['required_with:vital_signs', 'numeric', 'min:0', 'max:300'],
            'vital_signs.weight' => ['required_with:vital_signs', 'numeric', 'min:0', 'max:500'],
            'vital_signs.systole' => ['nullable', 'integer', 'min:0', 'max:300'],
            'vital_signs.diastole' => ['nullable', 'integer', 'min:0', 'max:300'],
            'vital_signs.heart_rate' => ['nullable', 'integer', 'min:0', 'max:300'],
            'vital_signs.respiration_rate' => ['nullable', 'integer', 'min:0', 'max:100'],
            'vital_signs.temperature' => ['nullable', 'numeric'],
            'prescription_items' => ['required', 'array', 'min:1'],
            'prescription_items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'prescription_items.*.quantity' => ['required', 'integer', 'min:1'],
            'prescription_items.*.dosage' => ['required', 'string'],
            'prescription_items.*.instruction' => ['required', 'string'],
        ];
    }
}
