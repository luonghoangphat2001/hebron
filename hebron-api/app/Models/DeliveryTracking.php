<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryTracking extends Model
{
    protected $fillable = [
        'order_id',
        'invoice_number',
        'waybill_registered_at',
        'delivery_status',
        'courier_name',
        'tracking_info',
    ];

    protected $casts = [
        'waybill_registered_at' => 'date',
        'delivery_status' => DeliveryStatus::class,
        'tracking_info' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
