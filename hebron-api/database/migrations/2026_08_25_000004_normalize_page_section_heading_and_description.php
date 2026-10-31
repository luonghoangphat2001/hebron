<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('page_sections')
            ->select(['id', 'title', 'description', 'content'])
            ->whereNotNull('content')
            ->orderBy('id')
            ->chunkById(100, function ($sections): void {
                foreach ($sections as $section) {
                    $content = json_decode($section->content, true);

                    if (! is_array($content)) {
                        continue;
                    }

                    $hasHeading = array_key_exists('heading', $content);
                    $hasDescription = array_key_exists('description', $content);

                    if (! $hasHeading && ! $hasDescription) {
                        continue;
                    }

                    DB::table('page_sections')->where('id', $section->id)->update([
                        'title' => $hasHeading ? $content['heading'] : $section->title,
                        'description' => $hasDescription ? $content['description'] : $section->description,
                        'content' => json_encode(
                            Arr::except($content, ['heading', 'description']),
                            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
                        ),
                    ]);
                }
            });
    }

    public function down(): void
    {
        // The old duplicated content keys are intentionally not restored.
    }
};
