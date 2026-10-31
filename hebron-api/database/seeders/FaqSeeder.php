<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\User;
use App\Enums\FaqCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqSeeder extends Seeder
{
    public function run()
    {
        $this->truncateFaqTable();

        $admin = User::where('username', 'superadmin')->first();

        $faqs = [
            [
                'category' => FaqCategory::CUSTOMER_SERVICE->value,
                'question' => 'How do I place an order?',
                'answer' => 'You can place an order by adding products to your cart and proceeding to checkout from the cart page.',
                'sort_order' => 1,
                'is_active' => true,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
            [
                'category' => FaqCategory::CUSTOMER_SERVICE->value,
                'question' => 'Can I cancel my order after it has been placed?',
                'answer' => 'Orders can be cancelled within 30 minutes of placing them, as long as they have not entered the shipping process.',
                'sort_order' => 2,
                'is_active' => true,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
            [
                'category' => FaqCategory::ACCOUNTING->value,
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept credit cards, bank transfers, and major mobile payment providers.',
                'sort_order' => 1,
                'is_active' => true,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
            [
                'category' => FaqCategory::ACCOUNTING->value,
                'question' => 'Is my payment information secure?',
                'answer' => 'Yes, all payment information is encrypted and processed through certified secure payment gateways.',
                'sort_order' => 2,
                'is_active' => true,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
            [
                'category' => FaqCategory::SHIPPING_DELIVERY->value,
                'question' => 'How long does delivery take?',
                'answer' => 'Standard delivery takes 3 to 5 business days depending on your location.',
                'sort_order' => 1,
                'is_active' => true,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
            [
                'category' => FaqCategory::SHIPPING_DELIVERY->value,
                'question' => 'Do you ship internationally?',
                'answer' => 'Currently we only ship within the domestic region. International shipping is planned for a future release.',
                'sort_order' => 2,
                'is_active' => false,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
            [
                'category' => FaqCategory::PRODUCTION->value,
                'question' => 'How do I upgrade my membership tier?',
                'answer' => 'Membership tiers are upgraded automatically based on your accumulated purchases and activity.',
                'sort_order' => 1,
                'is_active' => true,
                'view_count' => 0,
                'exposure_target' => ['all'],
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create(array_merge($faq, [
                'created_by' => $admin?->id,
            ]));
        }

        $this->command->info('FAQ seeded successfully!');
    }

    private function truncateFaqTable(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('faqs')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
