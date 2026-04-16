<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['id', 'name'])]
class Medicine extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    public function prices(): HasMany
    {
        return $this->hasMany(Price::class);
    }
}
