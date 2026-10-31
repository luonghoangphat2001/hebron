<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('craftsmanship_values', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->json('media')->nullable();
            $table->longText('description')->nullable();
            $table->string('button_label', 100)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('craftsmanship_value_product', function (Blueprint $table) {
            $table->foreignId('craftsmanship_value_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->unique(['craftsmanship_value_id', 'product_id'], 'craftsmanship_value_product_unique');
        });

        $this->migrateExistingSections();
    }

    public function down(): void
    {
        if (Schema::hasTable('craftsmanship_values')) {
            $values = DB::table('craftsmanship_values')->get()->keyBy('id');

            DB::table('page_sections')
                ->where('section_type', 'craftsmanship_values')
                ->orderBy('id')
                ->get()
                ->each(function (object $section) use ($values): void {
                    $content = json_decode($section->content ?? 'null', true) ?: [];
                    $ids = $content['craftsmanship_value_ids'] ?? [];
                    $content['items'] = collect($ids)->map(function ($id) use ($values): ?array {
                        $value = $values->get((int) $id);

                        if ($value === null) {
                            return null;
                        }

                        $media = json_decode($value->media ?? 'null', true) ?: [];

                        return [
                            'key' => $value->key,
                            'title' => $value->title,
                            'subtitle' => $value->subtitle,
                            'image_url' => collect($media)->firstWhere('type', 'image')['url'] ?? null,
                            'button_label' => $value->button_label,
                            'description' => $value->description,
                        ];
                    })->filter()->values()->all();
                    unset($content['craftsmanship_value_ids']);

                    DB::table('page_sections')->where('id', $section->id)->update([
                        'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]);
                });
        }

        Schema::dropIfExists('craftsmanship_value_product');
        Schema::dropIfExists('craftsmanship_values');
    }

    private function migrateExistingSections(): void
    {
        $now = now();

        DB::table('page_sections')
            ->where('section_type', 'craftsmanship_values')
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get()
            ->each(function (object $section) use ($now): void {
                $content = json_decode($section->content ?? 'null', true) ?: [];

                if (array_key_exists('craftsmanship_value_ids', $content)) {
                    return;
                }

                $ids = [];
                foreach (array_slice($content['items'] ?? [], 0, 3) as $index => $item) {
                    $key = $item['key'] ?? 'craftsmanship_value_'.($index + 1);
                    $media = empty($item['image_url']) ? [] : [[
                        'type' => 'image',
                        'url' => $item['image_url'],
                        'thumbnail' => null,
                        'alt' => $item['title'] ?? null,
                        'sort_order' => 0,
                    ]];

                    $existingId = DB::table('craftsmanship_values')->where('key', $key)->value('id');
                    if ($existingId !== null) {
                        $ids[] = (int) $existingId;

                        continue;
                    }

                    $ids[] = DB::table('craftsmanship_values')->insertGetId([
                        'key' => $key,
                        'title' => $item['title'] ?? $key,
                        'subtitle' => $item['subtitle'] ?? null,
                        'media' => json_encode($media, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        'description' => $item['description'] ?? null,
                        'button_label' => $item['button_label'] ?? '더 보기',
                        'sort_order' => ($index + 1) * 10,
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                unset($content['items']);
                $content['craftsmanship_value_ids'] = $ids;

                DB::table('page_sections')->where('id', $section->id)->update([
                    'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'updated_at' => $now,
                ]);
            });
    }
};
