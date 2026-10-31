<?php

namespace Database\Seeders;

use App\Enums\ShoppingSettingType;
use App\Models\ShoppingSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShoppingSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0');
        \Illuminate\Support\Facades\DB::table('shopping_settings')->truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $settings = [
            [
                'title' => 'General Precautions',
                'content' => 'Content for General Precautions.',
                'type' => ShoppingSettingType::GENERAL_PRECAUTIONS,
            ],
            [
                'title' => 'General Production Guide',
                'content' => 'Content for General Production Guide.',
                'type' => ShoppingSettingType::GENERAL_PRODUCTION_GUIDE,
            ],
            [
                'title' => 'Shipment & Delivery Information',
                'content' => 'Content for Shipment & Delivery Information.',
                'type' => ShoppingSettingType::SHIPMENT_DELIVERY_INFORMATION,
            ],
            [
                'title' => 'User Guide',
                'content' => 'Content for User Guide.',
                'type' => ShoppingSettingType::USER_GUIDE,
            ],
        ];

        foreach ($settings as $setting) {
            ShoppingSetting::firstOrCreate(
                ['type' => $setting['type']],
                $setting
            );
        }
    }
}
