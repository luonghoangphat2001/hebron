<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_sections', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
        });

        DB::table('page_sections')
            ->whereIn('section_type', [
                'portfolio_preview',
                'portfolio_featured',
                'craftsmanship_values',
            ])
            ->orderBy('id')
            ->each(function ($section): void {
                $content = json_decode($section->content ?? '[]', true);
                $content = is_array($content) ? $content : [];
                $updates = [];

                if ($section->section_type === 'portfolio_preview') {
                    $updates['description'] = $content['description'] ?? null;
                }

                $content = Arr::except($content, match ($section->section_type) {
                    'portfolio_preview', 'portfolio_featured' => ['description'],
                    'craftsmanship_values' => ['craftsmanship_value_ids'],
                    default => [],
                });

                DB::table('page_sections')->where('id', $section->id)->update(array_merge($updates, [
                    'content' => json_encode($content, JSON_UNESCAPED_UNICODE),
                ]));
            });

        DB::table('page_sections')->where('section_type', 'portfolio_featured')->update([
            'content' => null,
        ]);

        DB::table('page_sections')->where('section_type', 'portfolio_list')->update([
            'content' => json_encode([
                'list_endpoint' => '/api/brand/portfolios',
                'detail_endpoint' => '/api/brand/portfolios/{id}',
            ], JSON_UNESCAPED_UNICODE),
        ]);
    }

    public function down(): void
    {
        Schema::table('page_sections', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
