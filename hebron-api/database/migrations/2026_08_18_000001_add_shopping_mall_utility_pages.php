<?php

use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        PageSeeder::seedShoppingMallUtilityPages();
    }

    public function down(): void
    {
        $pageIds = DB::table('pages')
            ->where('site_type', 'SHOPPING_MALL')
            ->whereIn('slug', ['order-lookup', 'terms', 'privacy'])
            ->pluck('id');

        DB::table('page_sections')->whereIn('page_id', $pageIds)->delete();
        DB::table('pages')->whereIn('id', $pageIds)->delete();
    }
};
