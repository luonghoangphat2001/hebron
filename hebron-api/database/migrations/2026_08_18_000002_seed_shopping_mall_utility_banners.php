<?php

use Database\Seeders\BannerSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        BannerSeeder::seedShoppingMallUtilityBanners();
    }

    public function down(): void
    {
        DB::table('banners')
            ->where('site_type', 'SHOPPING_MALL')
            ->whereIn('page_type', ['order_lookup', 'terms', 'privacy'])
            ->whereIn('name', ['주문조회 Hero', '이용약관 Hero', '개인정보처리방침 Hero'])
            ->delete();
    }
};
