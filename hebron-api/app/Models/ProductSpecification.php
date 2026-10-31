<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size',
        'materials',
        'case',
        'product_period',
        'total_product_amount',
        'shipping_info',
        'weight',
        'notes',
    ];

    protected $casts = [
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
