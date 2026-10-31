<?php

namespace App\Models;

use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use SoftDeletes;

    protected $with = ['categories'];

    protected $table = 'media';

    protected $fillable = [
        'site_type', 'title', 'description', 'file_path',
        'thumbnail_path', 'url', 'link_url', 'sort_order', 'is_active', 'created_by',
    ];

    protected $casts = [
        'site_type' => SiteType::class,
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function categories(): MorphToMany
    {
        return $this->morphToMany(PostCategory::class, 'subject', 'category_post', 'subject_id', 'category_id')
            ->withTimestamps();
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
