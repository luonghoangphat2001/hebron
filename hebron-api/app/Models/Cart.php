<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use App\Support\CommerceIdentity;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_token_hash',
    ];

    protected $hidden = [
        'guest_token_hash',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the cart.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class)->orderBy('created_at');
    }

    public function scopeOwnedByIdentity(Builder $query, CommerceIdentity $identity): Builder
    {
        return $identity->scope($query);
    }

    /**
     * Get or create cart for user.
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return static::firstOrCreate(['user_id' => $userId]);
    }

    public static function getOrCreateForGuest(string $guestTokenHash): self
    {
        return static::firstOrCreate(['guest_token_hash' => $guestTokenHash]);
    }

    /**
     * Calculate total price of all items in cart.
     */
    public function getTotalAmountAttribute(): float
    {
        return (float) $this->items->sum(fn ($item) => (float) $item->subtotal);
    }

    /**
     * Calculate total quantity of all items in cart.
     */
    public function getTotalQuantityAttribute(): int
    {
        return (int) $this->items->sum(fn ($item) => (int) $item->quantity);
    }
}
