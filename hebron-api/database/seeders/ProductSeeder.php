<?php

namespace Database\Seeders;

use App\Enums\ErpOptionGroupCode;
use App\Models\Category;
use App\Models\Product;
use App\Services\Admin\AdminProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $this->truncateProductTables();
        Product::create([
            'name' => 'Sample Product',
            'slug' => 'sample-product',
            'description' => 'A sample product for testing.',
            'short_description' => 'Short description here.',
            'supply_price' => 10000,
            'selling_price' => 15000,
            'brand_site_price' => 12000,
            'plain_site_price' => 11000,
            'shipping_fee' => 500,
            'sku' => 'SP001',
            'images' => ['image1.jpg', 'image2.jpg'],
            'is_popular' => false,
            'is_featured' => true,
            'stock_quantity' => 100,
            'min_quantity' => 1,
            'max_quantity' => 500,
            'has_option' => true,
            'option_type' => 'color',
            'sort_order' => 1,
            'visible_roles' => ['ALL'],
            'is_active' => true,
            'view_count' => 0,
            'exposure_count' => 0,
            'average_rating' => 0,
            'total_reviews' => 0,
            'total_rating' => 0,
        ]);

        Product::create([
            'name' => 'Another Product',
            'slug' => 'another-product',
            'description' => 'Another sample product.',
            'short_description' => 'Another short description.',
            'supply_price' => 20000,
            'selling_price' => 25000,
            'brand_site_price' => 22000,
            'plain_site_price' => 21000,
            'shipping_fee' => 750,
            'sku' => 'AP002',
            'images' => ['image3.jpg'],
            'is_popular' => true,
            'is_featured' => false,
            'stock_quantity' => 50,
            'min_quantity' => 2,
            'max_quantity' => 300,
            'has_option' => false,
            'option_type' => '',
            'sort_order' => 2,
            'visible_roles' => ['ALL'],
            'is_active' => true,
            'view_count' => 0,
            'exposure_count' => 0,
            'average_rating' => 4,
            'total_reviews' => 10,
            'total_rating' => 40,
        ]);

        $this->command->info("Product seeded successfully!");
    }

    private function truncateProductTables(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('products')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
