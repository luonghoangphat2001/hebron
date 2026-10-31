<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PortfolioSeeder::class,
            MembershipTierSeeder::class,
            UserSeeder::class,
            MediaSeeder::class,
            ProductSeeder::class,
            FaqSeeder::class,
            NoticeSeeder::class,
            BannerSeeder::class,
            ShoppingMallHomeSectionSeeder::class,
            OrderSeeder::class,
            OrderShipmentSeeder::class,
        ]);
    }
}
