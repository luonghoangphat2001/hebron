<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PageSection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['page_id', 'section_type', 'title', 'description', 'subtitle', 'content', 'image', 'link', 'sort_order', 'is_active', 'metadata'];

    protected $casts = ['content' => 'array', 'metadata' => 'array', 'sort_order' => 'integer', 'is_active' => 'boolean'];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
