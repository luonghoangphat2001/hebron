<?php

namespace App\Models;

use App\Enums\OrderShipmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderShipment extends Model
{
    protected $fillable = [
        'order_id',
        'status',
        'invoice_number',
        'tracking_number',
        'carrier_code',
        'carrier_name',
        'shipping_method',
        'memo',
        'shipping_fee',
        'shipping_name',
        'shipping_phone',
        'shipping_postcode',
        'shipping_address',
        'shipping_address_detail',
        'shipped_at',
        'delivered_at',
        'tracking_last_synced_at',
        'tracking_level',
    ];

    protected $casts = [
        'status' => OrderShipmentStatus::class,
        'shipping_fee' => 'integer',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'tracking_last_synced_at' => 'datetime',
        'tracking_level' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function trackingEvents(): HasMany
    {
        return $this->hasMany(ShipmentTrackingEvent::class)->orderByDesc('event_at')->orderByDesc('id');
    }
}
