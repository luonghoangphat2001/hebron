<?php

namespace App\Models;

use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Model;

class AboutCta extends Model
{
    public const SUPPORTED_SITE_TYPES = [
        SiteType::BRAND_SITE->value,
        SiteType::SHOPPING_MALL->value,
    ];

    public const SHARED_FIELDS = [
        'title',
        'subtitle',
        'content',
        'image',
        'link',
        'metadata',
    ];

    protected $fillable = [
        'site_type',
        ...self::SHARED_FIELDS,
    ];

    protected $casts = [
        'site_type' => SiteType::class,
        'content' => 'array',
        'metadata' => 'array',
    ];
}
