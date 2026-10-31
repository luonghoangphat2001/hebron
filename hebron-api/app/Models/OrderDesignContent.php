<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;
use App\Support\CommerceIdentity;

class OrderDesignContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_token_hash',
        'title',
        'recipient_name',
        'event_date',
        'main_text',
        'sender_name',
        'attachment_file_urls',
    ];

    protected $hidden = ['guest_token_hash'];

    public function scopeOwnedByIdentity(Builder $query, CommerceIdentity $identity): Builder
    {
        return $identity->scope($query);
    }

    protected $casts = [
        'event_date' => 'datetime',
        'attachment_file_urls' => 'array',
    ];

    public function orderItem(): HasOne
    {
        return $this->hasOne(OrderItem::class);
    }

    public function cartItem(): HasOne
    {
        return $this->hasOne(CartItem::class);
    }
}
