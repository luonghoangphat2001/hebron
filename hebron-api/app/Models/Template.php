<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Template extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'product_id',
        'background_id',
        'specifications',
        'font_set',
        'color_set',
        'spot_color',
        'layout_config',
        'editor_permission',
        'preview_images',
        'front_preview_url',
        'back_preview_url',
        'is_active',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'specifications' => 'array',
        'font_set' => 'array',
        'color_set' => 'array',
        'spot_color' => 'array',
        'layout_config' => 'array',
        'editor_permission' => 'array',
        'preview_images' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the product that this template is linked to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function background(): BelongsTo
    {
        return $this->belongsTo(Background::class);
    }

    /**
     * Get the user who created this template.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by product.
     */
    public function scopeForProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Configure activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'product_id',
                'background_id',
                'specifications',
                'font_set',
                'color_set',
                'spot_color',
                'layout_config',
                'editor_permission',
                'preview_images',
                'is_active',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Template has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        // We can extend later to include custom metadata such as reason or actor.
    }
}
