<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderArtwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'design_group_id',
        'layout_data',
        'layout_s3_path',
        'logo_path',
        'preview_image_path',
    ];

    protected $casts = [
        'layout_data' => 'array',
    ];

    public function designGroup(): BelongsTo
    {
        return $this->belongsTo(DesignGroup::class);
    }

    public function getSibling(): ?self
    {
        if (! $this->design_group_id) {
            return null;
        }

        return static::where('design_group_id', $this->design_group_id)
            ->where('id', '!=', $this->id)
            ->first();
    }
}