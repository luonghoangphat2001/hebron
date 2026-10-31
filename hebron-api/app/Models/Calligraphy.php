<?php

namespace App\Models;

use App\Enums\CalligraphyType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Calligraphy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'image_path',
        'type',
        'text',
        'created_by',
    ];

    protected $casts = [
        'type' => CalligraphyType::class,
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
