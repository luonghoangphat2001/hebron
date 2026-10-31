<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PostCategory extends Model
{
    use SoftDeletes;

    protected $fillable = ['board_category_no', 'name', 'page_type', 'is_active'];

    protected $casts = [
        'board_category_no' => 'integer',
        'is_active' => 'boolean',
    ];

    public function notices(): MorphToMany
    {
        return $this->morphedByMany(Notice::class, 'subject', 'category_post', 'category_id', 'subject_id');
    }

    public function faqs(): MorphToMany
    {
        return $this->morphedByMany(Faq::class, 'subject', 'category_post', 'category_id', 'subject_id');
    }

    public function portfolios(): MorphToMany
    {
        return $this->morphedByMany(Portfolio::class, 'subject', 'category_post', 'category_id', 'subject_id');
    }

    public function media(): MorphToMany
    {
        return $this->morphedByMany(Media::class, 'subject', 'category_post', 'category_id', 'subject_id');
    }

    public function exampleSentenceSamples(): MorphToMany
    {
        return $this->morphedByMany(ExampleSentenceSample::class, 'subject', 'category_post', 'category_id', 'subject_id');
    }
}
