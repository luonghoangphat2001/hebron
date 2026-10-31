<?php

use App\Models\Faq;
use App\Models\Media;
use App\Models\Notice;
use App\Models\Portfolio;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const SUBJECT_TYPES = [
        'notice' => Notice::class,
        'faq' => Faq::class,
        'portfolio' => Portfolio::class,
        'media' => Media::class,
    ];

    public function up(): void
    {
        foreach (self::SUBJECT_TYPES as $alias => $model) {
            DB::table('category_post')->where('subject_type', $alias)->update(['subject_type' => $model]);
        }
    }

    public function down(): void
    {
        foreach (self::SUBJECT_TYPES as $alias => $model) {
            DB::table('category_post')->where('subject_type', $model)->update(['subject_type' => $alias]);
        }
    }
};
