<?php

namespace App\Models;

use App\Services\PrintPdfService;
use App\Support\CommerceIdentity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DesignGroup extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::deleted(fn (DesignGroup $group) => app(PrintPdfService::class)->delete($group));
    }

    protected $fillable = [
        'user_id',
        'guest_token_hash',
        'product_id',
        'title',
        'layout_data',
        'layout_s3_path',
        'logo_path',
        'preview_image_path',
        'metadata',
        'revised_file_path',
        'revised_file_name',
        'rejection_reason',
        'confirmation_requested_at',
        'confirmed_at',
        'rejected_at',
    ];

    protected $hidden = [
        'guest_token_hash',
        'print_pdf_path',
        'print_pdf_digest',
    ];

    protected $casts = [
        'layout_data' => 'array',
        'metadata' => 'array',
        'confirmation_requested_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOwnedByIdentity(Builder $query, CommerceIdentity $identity): Builder
    {
        return $identity->scope($query);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orderArtworks(): HasMany
    {
        return $this->hasMany(OrderArtwork::class);
    }
}
