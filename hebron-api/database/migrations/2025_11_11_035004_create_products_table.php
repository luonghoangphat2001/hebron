
<?php

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
        Schema::create('products', function (Blueprint $table) {
            // 1. Identification & Relationship
            $table->id();
            $table->string('sku', 100)->unique()->nullable();
            $table->string('slug', 200)->unique();
            $table->string('name', 200);
            $table->string('name_en', 100)->nullable();

            // 2. Pricing & Stock
            $table->decimal('selling_price', 15, 2);
            $table->decimal('brand_site_price', 15, 2);
            $table->decimal('plain_site_price', 15, 2);
            $table->decimal('shipping_fee', 15, 2)->default(0);
            $table->decimal('supply_price', 15, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_quantity')->default(1);
            $table->integer('max_quantity')->default(0);

            // 3. Content & Media
            $table->text('short_description')->nullable();
            $table->mediumText('description')->nullable();
            $table->mediumText('mobile_description')->nullable();
            $table->json('images')->nullable();

            // 3.1 Option
            $table->boolean('has_option')->default(false);
            $table->string('option_type', 200)->nullable();

            // 4. Status & Flags
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->json('visible_roles')->nullable();

            // 5. Analytics & Admin Filters
            $table->integer('view_count')->default(0);
            $table->unsignedInteger('exposure_count')->default(0)->comment('Times exposed to users');
            $table->string('average_rating', 255)->nullable();
            $table->string('total_reviews', 255)->nullable();
            $table->string('total_rating', 255)->nullable();

            // 6. System
            $table->timestamps();
            $table->softDeletes();

            // 7. Indexes
            $table->index(['is_popular', 'is_active']);
            $table->index('exposure_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
