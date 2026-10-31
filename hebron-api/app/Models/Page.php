<?php

namespace App\Models;

use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['site_type', 'page_type', 'slug', 'title', 'subtitle', 'description', 'image', 'sort_order', 'is_active', 'metadata'];

    protected $casts = ['site_type' => SiteType::class, 'sort_order' => 'integer', 'is_active' => 'boolean', 'metadata' => 'array'];

    public function sections()
    {
        return $this->hasMany(PageSection::class)->ordered();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfSite($query, SiteType|string $siteType)
    {
        return $query->where('site_type', $siteType instanceof SiteType ? $siteType->value : $siteType);
    }
}
