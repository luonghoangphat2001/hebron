<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiry_comments', function (Blueprint $table) {
            $table->string('contact_phone', 20)
                ->nullable()
                ->after('content')
                ->comment('Phone number used for this reply');
        });

        // Preserve the currently visible phone for existing admin replies.
        DB::table('inquiries')
            ->select(['id', 'reply_contact_phone'])
            ->whereNotNull('reply_contact_phone')
            ->orderBy('id')
            ->chunkById(500, function ($inquiries): void {
                foreach ($inquiries as $inquiry) {
                    DB::table('inquiry_comments')
                        ->where('inquiry_id', $inquiry->id)
                        ->where('is_admin', true)
                        ->whereNull('contact_phone')
                        ->update(['contact_phone' => $inquiry->reply_contact_phone]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('inquiry_comments', function (Blueprint $table) {
            $table->dropColumn('contact_phone');
        });
    }
};
