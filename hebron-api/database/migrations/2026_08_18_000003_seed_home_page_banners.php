<?php

use Database\Seeders\BannerSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        BannerSeeder::seedHomeBanners();
    }

    public function down(): void
    {
        DB::table('banners')
            ->where('page_type', 'home_page')
            ->whereIn('name', ['Brand Home Hero', 'Shopping Mall Home Hero', 'Vendor Home Hero'])
            ->delete();
    }
};
