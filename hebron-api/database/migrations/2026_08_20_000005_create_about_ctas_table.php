<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('about_ctas', function (Blueprint $table) {
            $table->id();
            $table->string('site_type', 50)->unique();
            $table->string('title', 255)->nullable();
            $table->string('subtitle', 255)->nullable();
            $table->json('content')->nullable();
            $table->string('image', 500)->nullable();
            $table->string('link', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        $now = now();
        $sourceSections = DB::table('page_sections')
            ->join('pages', 'pages.id', '=', 'page_sections.page_id')
            ->where('page_sections.section_type', 'about_cta')
            ->whereNull('page_sections.deleted_at')
            ->whereNull('pages.deleted_at')
            ->orderBy('page_sections.id')
            ->get([
                'pages.site_type',
                'page_sections.title',
                'page_sections.subtitle',
                'page_sections.content',
                'page_sections.image',
                'page_sections.link',
                'page_sections.metadata',
            ])
            ->unique('site_type');

        foreach ($sourceSections as $section) {
            DB::table('about_ctas')->insert([
                'site_type' => $section->site_type,
                'title' => $section->title,
                'subtitle' => $section->subtitle,
                'content' => $section->content,
                'image' => $section->image,
                'link' => $section->link,
                'metadata' => $section->metadata,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $brandPages = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->whereIn('page_type', ['home_page', 'process', 'media'])
            ->whereNull('deleted_at')
            ->get(['id', 'page_type']);

        foreach ($brandPages as $page) {
            $exists = DB::table('page_sections')
                ->where('page_id', $page->id)
                ->where('section_type', 'about_cta')
                ->whereNull('deleted_at')
                ->exists();

            if ($exists) {
                continue;
            }

            $sortOrder = ((int) DB::table('page_sections')
                ->where('page_id', $page->id)
                ->whereNull('deleted_at')
                ->max('sort_order')) + 10;

            DB::table('page_sections')->insert([
                'page_id' => $page->id,
                'section_type' => 'about_cta',
                'sort_order' => $sortOrder,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('about_ctas')) {
            return;
        }

        foreach (DB::table('about_ctas')->get() as $aboutCta) {
            $sectionIds = DB::table('page_sections')
                ->join('pages', 'pages.id', '=', 'page_sections.page_id')
                ->where('pages.site_type', $aboutCta->site_type)
                ->where('page_sections.section_type', 'about_cta')
                ->pluck('page_sections.id');

            DB::table('page_sections')
                ->whereIn('id', $sectionIds)
                ->update([
                    'title' => $aboutCta->title,
                    'subtitle' => $aboutCta->subtitle,
                    'content' => $aboutCta->content,
                    'image' => $aboutCta->image,
                    'link' => $aboutCta->link,
                    'metadata' => $aboutCta->metadata,
                ]);
        }

        Schema::dropIfExists('about_ctas');
    }
};
