<?php

namespace App\Models;

use App\Enums\ShoppingSettingType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
    ];

    protected $casts = [
        'type' => ShoppingSettingType::class,
    ];
}