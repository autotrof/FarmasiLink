<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['id', 'examination_id', 'status', 'served_date', 'served_by', 'total'])]
class Prescription extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $casts = [
        'served_date' => 'datetime',
    ];

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    /**
     * Get the prescription items for the prescription.
     *
     * @return HasMany<PrescriptionItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function isServed(): bool
    {
        return $this->status === 'served';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
