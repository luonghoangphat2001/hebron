<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductOptionGroupProduct extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'product_option_group_id',
        'sort_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function optionGroup()
    {
        return $this->belongsTo(ProductOptionGroup::class);
    }
}