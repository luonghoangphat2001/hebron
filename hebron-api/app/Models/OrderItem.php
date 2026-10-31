<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'design_group_id',
        'order_design_content_id',

        'title',
        'quantity',

        'supply_price',
        'selling_price',
        'option_price',
        'sub_total_amount',
        'tax_amount',
        'total_amount',

        'configuration', //snapshort
        'notes',
    ];

    protected $casts = [
        'configuration' => 'array',
        'supply_price' => 'integer',
        'selling_price'=> 'integer',
        'option_price' => 'integer',
        'sub_total_amount' => 'integer',
        'tax_amount' => 'integer',
        'total_amount' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

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
}
