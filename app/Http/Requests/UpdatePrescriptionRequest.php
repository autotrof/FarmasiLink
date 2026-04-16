<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePrescriptionRequest extends FormRequest
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
            'prescription_items' => ['required', 'array', 'min:1'],
            'prescription_items.*.id' => ['nullable', 'exists:prescription_items,id'],
            'prescription_items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'prescription_items.*.quantity' => ['required', 'integer', 'min:1'],
            'prescription_items.*.dosage' => ['required', 'string'],
            'prescription_items.*.instruction' => ['required', 'string'],
        ];
    }
}
