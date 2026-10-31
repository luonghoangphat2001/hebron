<?php

namespace Database\Seeders;

use App\Enums\NoticeType;
use App\Models\Notice;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NoticeSeeder extends Seeder
{
    public function run()
    {
        $this->truncateNoticeTable();

        $admin = User::where('authority', \App\Enums\UserAuthority::SUPER_ADMIN)->first()
            ?? User::first();

        $notices = [
            [
                'title' => 'Welcome to Hebron',
                'content' => 'Thank you for joining Hebron. We are committed to providing the best service for your business.',
                'type' => NoticeType::GENERAL->value,
                'is_pinned' => false,
                'is_active' => true,
                'view_count' => 0,
                'published_at' => now()->subDays(10),
                'expires_at' => null,
                'exposure_target' => ['all'],
                'exposure_location' => 'main',
                'attachments' => [],
            ],
            [
                'title' => 'Scheduled System Maintenance',
                'content' => 'The system will undergo maintenance on the first Sunday of next month from 02:00 to 04:00 (KST). Some services may be temporarily unavailable.',
                'type' => NoticeType::MAINTENANCE->value,
                'is_pinned' => true,
                'is_active' => true,
                'view_count' => 0,
                'published_at' => now()->subDays(2),
                'expires_at' => now()->addDays(20),
                'exposure_target' => ['all'],
                'exposure_location' => 'main',
                'attachments' => [],
            ],
            [
                'title' => 'Important: Pricing Policy Update',
                'content' => 'We have updated our pricing policy effective next quarter. Please review the new tiers and contact your account manager for details.',
                'type' => NoticeType::IMPORTANT->value,
                'is_pinned' => true,
                'is_active' => true,
                'view_count' => 0,
                'published_at' => now()->subDay(),
                'expires_at' => null,
                'exposure_target' => ['all'],
                'exposure_location' => 'dashboard',
                'attachments' => [],
            ],
            [
                'title' => 'Upcoming Holiday Closure',
                'content' => 'Our office will be closed during the national holiday. Order processing will resume on the following business day.',
                'type' => NoticeType::GENERAL->value,
                'is_pinned' => false,
                'is_active' => true,
                'view_count' => 0,
                'published_at' => now()->addDay(),
                'expires_at' => now()->addDays(7),
                'exposure_target' => ['all'],
                'exposure_location' => 'login',
                'attachments' => [],
            ],
            [
                'title' => 'Draft Notice (Inactive)',
                'content' => 'This notice is saved but not yet published for public visibility.',
                'type' => NoticeType::GENERAL->value,
                'is_pinned' => false,
                'is_active' => false,
                'view_count' => 0,
                'published_at' => now(),
                'expires_at' => null,
                'exposure_target' => ['all'],
                'exposure_location' => 'main',
                'attachments' => [],
            ],
        ];

        foreach ($notices as $notice) {
            Notice::create(array_merge($notice, [
                'created_by' => $admin?->id,
            ]));
        }

        $this->command->info('Notice seeded successfully!');
    }

    private function truncateNoticeTable(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('notices')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
