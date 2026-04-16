<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['id', 'patient_number', 'name', 'date_of_birth', 'gender', 'phone', 'address', 'medical_history'])]
class Patient extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class);
    }
}
