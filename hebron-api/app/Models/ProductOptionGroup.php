<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductOptionGroup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'display_type',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function options(): HasMany
    {
        return $this->hasMany(ProductOption::class, 'option_group_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function allOptions(): HasMany
    {
        return $this->hasMany(ProductOption::class, 'option_group_id')
            ->orderBy('sort_order');
    }

    /**
     * Pivot rows linking this group to products, with sort_order.
     */
    public function productLinks(): HasMany
    {
        return $this->hasMany(ProductOptionGroupProduct::class, 'product_option_group_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_option_group_products',
            'product_option_group_id',
            'product_id'
        )
            ->withPivot('sort_order')
            ->wherePivotNull('deleted_at')
            ->orderByPivot('sort_order');
    }
}
