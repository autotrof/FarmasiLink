<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'action', 'model', 'model_id', 'description', 'ip_address', 'user_agent'])]
class Log extends Model
{
    /**
     * Get the user that made the log entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
