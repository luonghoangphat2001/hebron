<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExampleSentenceSample extends Model
{
    use SoftDeletes;

    protected $with = ['categories'];

    protected $fillable = [
        'title', 'board_category_no', 'content', 'attachments', 'is_active', 'is_featured', 'view_count',
    ];

    protected $casts = [
        'attachments' => 'array',
        'board_category_no' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'view_count' => 'integer',
    ];

    public function categories(): MorphToMany
    {
        return $this->morphToMany(PostCategory::class, 'subject', 'category_post', 'subject_id', 'category_id')
            ->withTimestamps();
    }
}
