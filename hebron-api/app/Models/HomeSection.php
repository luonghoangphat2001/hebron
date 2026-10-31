<?php

namespace App\Models;

use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HomeSection extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_HERO_SECTION = 'hero_section';
    public const TYPE_BRAND_STATEMENT = 'brand_statement';
    public const TYPE_PRODUCT_PREVIEW = 'product_preview';
    public const TYPE_NOTICES_PREVIEW = 'notices_preview';
    public const TYPE_PORTFOLIO_PREVIEW = 'portfolio_preview';
    public const TYPE_CLIENT_LOGOS = 'client_logos';
    public const TYPE_ABOUT_CTA = 'about_cta';

    public const TYPES = [
        self::TYPE_HERO_SECTION,
        self::TYPE_BRAND_STATEMENT,
        self::TYPE_PRODUCT_PREVIEW,
        self::TYPE_NOTICES_PREVIEW,
        self::TYPE_PORTFOLIO_PREVIEW,
        self::TYPE_CLIENT_LOGOS,
        self::TYPE_ABOUT_CTA,
    ];

    protected $fillable = [
        'site_type',
        'type',
        'title',
        'subtitle',
        'content',
        'image',
        'link',
        'sort_order',
        'is_active',
        'starts_at',
        'ends_at',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'content' => 'array',
        'metadata' => 'array',
        'site_type' => SiteType::class,
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /**
     * Scope a query to only include active sections.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            });
    }

    /**
     * Scope a query to order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfSite($query, SiteType|string $siteType)
    {
        $value = $siteType instanceof SiteType ? $siteType->value : $siteType;

        return $query->where('site_type', $value);
    }

    /**
     * Check if section is currently active (considering time constraints)
     */
    public function isCurrentlyActive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }
}
