<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductOption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'option_group_id',
        'name',
        'additional_price',
        'additional_brand_site_price',
        'additional_plain_site_price',
        'metadata',
        'sort_order',
        'is_active',
        'deleted_by',
    ];

    protected $casts = [
        'additional_price' => 'integer',
        'additional_brand_site_price' => 'integer',
        'additional_plain_site_price' => 'integer',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ProductOptionGroup::class, 'option_group_id');
    }

    public function deletedByUser()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    protected static function booted()
    {
        static::deleting(function ($model) {
            if (! $model->isForceDeleting()) {
                $userId = auth()->user()?->id;

                if (is_numeric($userId)) {
                    $model->deleted_by = $userId;
                    $model->saveQuietly();
                }
            }
        });
    }
}
