<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Category extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'legacy_category_id',
        'name',
        'name_en',
        'subtitle',
        'slug',
        'parent_id',
        'description',
        'image',
        'icon',
        'banner_image',
        'sort_order',
        'exposure_order',
        'is_active',
        'is_best',
        'exposure_start_date',
        'exposure_end_date',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_best' => 'boolean',
        'sort_order' => 'integer',
        'exposure_order' => 'integer',
        'exposure_start_date' => 'datetime',
        'exposure_end_date' => 'datetime',
    ];

    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Get the child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    /**
     * Get all direct child categories (admin: no is_active filter).
     */
    public function allChildren(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')
            ->orderBy('sort_order');
    }

    /**
     * Get all child categories recursively.
     */
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'category_product',
            'category_id',
            'product_id'
        )
            ->withPivot([
                'id',
                'sort_order',
                'deleted_at',
                'created_at',
                'updated_at',
            ])
            ->wherePivotNull('deleted_at')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function categoryProducts(): HasMany
    {
        return $this->hasMany(CategoryProduct::class, 'category_id');
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root categories (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the admin user who created this category.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Configure activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'name_en',
                'slug',
                'parent_id',
                'description',
                'image',
                'icon',
                'banner_image',
                'sort_order',
                'exposure_order',
                'is_active',
                'exposure_start_date',
                'exposure_end_date',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Category has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        // We can extend later to include custom metadata such as reason or actor.
    }
}
