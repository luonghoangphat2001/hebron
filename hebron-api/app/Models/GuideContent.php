<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class GuideContent extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'type',
        'attachments',
        'is_active',
        'published_at',
        'expires_at',
        'exposure_target',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'attachments' => 'array',
        'exposure_target' => 'array',
    ];

    /**
     * Scope a query to only include active guides.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include published guides.
     */
    public function scopePublished($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('published_at')
                ->orWhere('published_at', '<=', now());
        })->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now());
        });
    }

    /**
     * Scope a query to guides that are currently exposed.
     */
    public function scopeCurrentlyExposed(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function (Builder $q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->where(function (Builder $q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            });
    }

    /**
     * Scope a query to guides that are not currently exposed.
     */
    public function scopeNotCurrentlyExposed(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where('is_active', false)
                ->orWhereNull('is_active')
                ->orWhere(function (Builder $q2) {
                    $q2->whereNotNull('published_at')
                        ->where('published_at', '>', now());
                })
                ->orWhere(function (Builder $q2) {
                    $q2->whereNotNull('expires_at')
                        ->where('expires_at', '<', now());
                });
        });
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if guide is currently active (published and not expired).
     */
    public function isCurrentlyActive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->published_at && $this->published_at->isFuture()) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Get the admin user who created this guide.
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
                'title',
                'content',
                'type',
                'attachments',
                'is_active',
                'published_at',
                'expires_at',
                'exposure_target',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Guide Content has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        // We can extend later to include custom metadata such as reason or actor.
    }
}
