<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('craftsmanship_values', function (Blueprint $table): void {
            $table->string('image_url', 500)->nullable()->after('subtitle');
        });

        DB::table('craftsmanship_values')->orderBy('id')->get(['id', 'media'])->each(function (object $value): void {
            $media = json_decode($value->media ?? 'null', true) ?: [];
            $image = collect($media)->firstWhere('type', 'image') ?? collect($media)->first();

            DB::table('craftsmanship_values')->where('id', $value->id)->update([
                'image_url' => is_array($image) ? ($image['url'] ?? null) : null,
            ]);
        });

        Schema::table('craftsmanship_values', function (Blueprint $table): void {
            $table->dropColumn('media');
        });
    }

    public function down(): void
    {
        Schema::table('craftsmanship_values', function (Blueprint $table): void {
            $table->json('media')->nullable()->after('subtitle');
        });

        DB::table('craftsmanship_values')->orderBy('id')->get(['id', 'image_url'])->each(function (object $value): void {
            $media = empty($value->image_url) ? [] : [[
                'type' => 'image',
                'url' => $value->image_url,
                'thumbnail' => null,
                'alt' => null,
                'sort_order' => 0,
            ]];

            DB::table('craftsmanship_values')->where('id', $value->id)->update([
                'media' => json_encode($media, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ]);
        });

        Schema::table('craftsmanship_values', function (Blueprint $table): void {
            $table->dropColumn('image_url');
        });
    }
};
