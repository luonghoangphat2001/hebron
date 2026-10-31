<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('category_post')
            ->orderByDesc('id')
            ->get()
            ->groupBy(fn (object $row) => $row->subject_type.':'.$row->subject_id)
            ->each(function ($rows): void {
                DB::table('category_post')->whereIn('id', $rows->skip(1)->pluck('id'))->delete();
            });

        Schema::table('category_post', function (Blueprint $table) {
            $table->index('category_id');
            $table->dropUnique(['category_id', 'subject_type', 'subject_id']);
            $table->dropIndex(['subject_type', 'subject_id']);
            $table->unique(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::table('category_post', function (Blueprint $table) {
            $table->dropUnique(['subject_type', 'subject_id']);
            $table->unique(['category_id', 'subject_type', 'subject_id']);
            $table->index(['subject_type', 'subject_id']);
            $table->dropIndex(['category_id']);
        });
    }
};
