<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentTrackingEvent extends Model
{
    protected $fillable = ['order_shipment_id', 'provider_event_key', 'status', 'provider_level', 'provider_code', 'description', 'remark', 'location', 'event_at', 'payload', 'response'];

    protected $casts = ['event_at' => 'datetime', 'payload' => 'array', 'response' => 'array'];

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(OrderShipment::class, 'order_shipment_id');
    }
}
