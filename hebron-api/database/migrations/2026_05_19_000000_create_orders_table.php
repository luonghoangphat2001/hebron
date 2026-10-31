<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            // Extract enum values from Enums
            $shippingMethodValues = array_map(fn ($case) => $case->value, ShippingMethod::cases());

            // 1. Primary Key & Order Identification
            $table->id();
            $table->string('order_number')->unique();

            // 2. Foreign Keys (Relationships)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // 4. Status & Financials
            $table->string('status', 50)->default(OrderStatus::Pending->value);
            $table->string('payment_status', 50)->default('pending');
            $table->string('currency', 3)->default('KRW');
            $table->integer('subtotal_amount')->default(0);
            $table->integer('discount_amount')->default(0);
            $table->integer('tax_amount')->default(0);
            $table->integer('shipping_fee')->default(0);
            $table->integer('total_amount')->default(0);
            $table->string('payment_method', 50)->default(PaymentMethod::CARD->value);

            // 5. Contact / Ordering Party Information
            $table->string('contact_name');
            $table->string('contact_phone', 50);
            $table->string('contact_phone2', 50);
            $table->string('company_name')->nullable();
            $table->string('contact_email')->nullable();

            // 6. Shipping & Recipient Information
            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone', 50)->nullable();
            $table->string('shipping_postcode', 20)->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_address_detail')->nullable();

            // 7. Shipping Configuration
            $table->enum('shipping_method', $shippingMethodValues)->default(ShippingMethod::COURIER->value);

            // 10. Logistics & Timestamps
            $table->integer('estimated_production_days')->nullable();
            $table->timestamp('placed_at')->nullable();
            $table->text('customer_note')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
