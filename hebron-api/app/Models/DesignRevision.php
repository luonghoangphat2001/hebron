<?php

namespace App\Models;

use App\Enums\DesignRevisionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DesignRevision extends Model
{
    protected $fillable = [
        'order_id',
        'slug',
        'status',
        'files',
        'comments',
    ];

    protected $casts = [
        'files' => 'array',
        'comments' => 'array',
        'status' => DesignRevisionStatus::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}