<?php

namespace App\Models;

use Database\Seeders\ProductQuantityPricesTierSeeder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'design_group_id',
        'order_design_content_id',
        'quantity',
        'original_price',
        'sale_price',
        'selected_options',
        'option_price',
        'storage_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'original_price' => 'integer',
        'sale_price' => 'integer',
        'selected_options' => 'array',
        'option_price'=> 'integer',
        'storage_date' => 'datetime',
    ];

    /**
     * Get the cart that owns the item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product for the item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function designGroup(): BelongsTo
    {
        return $this->belongsTo(DesignGroup::class);
    }

    public function orderDesignContent(): BelongsTo
    {
        return $this->belongsTo(OrderDesignContent::class);
    }

    /**
     * Subtotal: pivot `price` is per-case unit price; multiply by quantity.
     *
     * @see ProductQuantityPricesTierSeeder
     */
    public function getSubtotalAttribute(): float
    {
        $pricePerCase = (float) ($this->sale_price ?? $this->product?->selling_price ?? 0);
        $quantity = (float) ($this->quantity ?? 1);

        return $pricePerCase * $quantity;
    }
}
