<?php

namespace App\Models;

use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Portfolio extends Model
{
    use HasFactory, SoftDeletes;

    protected $with = ['categories'];

    protected $fillable = [
        'title',
        'site_type',
        'client',
        'category',
        'year',
        'description',
        'cover_image',
        'gallery',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'site_type' => SiteType::class,
        'year' => 'integer',
        'gallery' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfSite($query, SiteType|string $siteType)
    {
        return $query->where('site_type', $siteType instanceof SiteType ? $siteType->value : $siteType);
    }

    public function categories(): MorphToMany
    {
        return $this->morphToMany(PostCategory::class, 'subject', 'category_post', 'subject_id', 'category_id')
            ->withTimestamps();
    }
}
