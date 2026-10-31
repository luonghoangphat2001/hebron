<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->string('revised_file_path')->nullable()->after('metadata');
            $table->string('revised_file_name')->nullable()->after('revised_file_path');
            $table->text('rejection_reason')->nullable()->after('revised_file_name');
            $table->timestamp('confirmation_requested_at')->nullable()->after('rejection_reason');
            $table->timestamp('confirmed_at')->nullable()->after('confirmation_requested_at');
            $table->timestamp('rejected_at')->nullable()->after('confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->dropColumn([
                'revised_file_path',
                'revised_file_name',
                'rejection_reason',
                'confirmation_requested_at',
                'confirmed_at',
                'rejected_at',
            ]);
        });
    }
};
