<?php

namespace App\Models;

use App\Casts\PaymentMethodCast;
use App\Enums\OrderStatus;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Http\Filters\Admin\OrderFillter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Order extends Model
{
    use Filterable, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'order_number',
        'user_id',
        'guest_token_hash',

        'status',
        'payment_status',

        'currency',
        'subtotal_amount',
        'discount_amount',
        'tax_amount',
        'shipping_fee',
        'total_amount',

        'payment_method',

        'contact_name',
        'contact_phone',
        'contact_phone2',
        'contact_email',
        'company_name',

        'shipping_name',
        'shipping_phone',
        'shipping_postcode',
        'shipping_address',
        'shipping_address_detail',
        'shipping_method',

        'estimated_production_days',
        'placed_at',
        'customer_note',
        'metadata',
    ];

    protected $hidden = [
        'guest_token_hash',
    ];

    protected $casts = [
        'metadata' => 'array',
        'requested_delivery_date' => 'date',
        'placed_at' => 'datetime',
        'subtotal_amount' => 'integer',
        'discount_amount' => 'integer',
        'tax_amount' => 'integer',
        'shipping_fee' => 'integer',
        'total_amount' => 'integer',
        'shipping_method' => ShippingMethod::class,
        'payment_method' => PaymentMethodCast::class,
    ];

    public ?string $logReason = null;

    public ?string $logBatchId = null;

    protected function getFiltersClass(): string
    {
        return OrderFillter::class;
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function designFiles(): HasMany
    {
        return $this->hasMany(OrderDesignFile::class);
    }

    public function designGroups(): HasMany
    {
        return $this->hasMany(DesignGroup::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentTransaction(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function orderShipment(): HasOne
    {
        return $this->hasOne(OrderShipment::class);
    }

    /**
     * All shipment records for the order.
     */
    public function orderShipments(): HasMany
    {
        return $this->hasMany(OrderShipment::class);
    }

    public function deliveryTracking(): HasOne
    {
        return $this->hasOne(DeliveryTracking::class);
    }

    /**
     * Snapshots written when the customer applies a saved address (배송지 변경).
     */
    public function shippingAddressHistories(): HasMany
    {
        return $this->hasMany(OrderShippingAddressHistory::class);
    }

    public function latestShippingAddressHistory(): HasOne
    {
        return $this->hasOne(OrderShippingAddressHistory::class)->latestOfMany('changed_at');
    }

    public function designRevisions(): HasMany
    {
        return $this->hasMany(DesignRevision::class);
    }

    public function latestDesignRevision()
    {
        return $this->hasOne(DesignRevision::class)
            ->latestOfMany('id');
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                // Status
                'status',
                // Basic information fields (for modification logs)
                'company_name',
                'contact_name',
                'contact_tel',
                'contact_phone',
                'contact_email',
                'shipping_name',
                'shipping_phone',
                'shipping_postcode',
                'shipping_address',
                'shipping_address_detail',
                'payment_method',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Order has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        if ($this->logReason) {
            $activity->properties = [...$activity->properties, 'reason' => $this->logReason];
        }

        if ($this->logBatchId) {
            $activity->batch_uuid = $this->logBatchId;
            $activity->properties = [...$activity->properties, 'batch_id' => $this->logBatchId];
        }
    }

    public function getIsPaidAttribute(): bool
    {
        return in_array($this->payment_status, ['paid', 'refunded', 'partially_refunded']);
    }

    /**
     * Get orders with completed status
     */
    public function scopeIsCompleted($query)
    {
        return $query->where('status', OrderStatus::Completed);
    }

    public function setStatusAttribute(string $value): void
    {
        if (! in_array($value, OrderStatus::values(), true)) {
            throw new \InvalidArgumentException('Invalid order status provided.');
        }

        $this->attributes['status'] = $value;
    }
}
