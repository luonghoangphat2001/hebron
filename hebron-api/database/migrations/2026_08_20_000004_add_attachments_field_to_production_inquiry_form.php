<?php

use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $this->updateFields(static function (array $fields): array {
            if (! in_array('attachments', $fields, true)) {
                $fields[] = 'attachments';
            }

            return $fields;
        });
    }

    public function down(): void
    {
        $this->updateFields(static fn (array $fields): array => array_values(
            array_filter($fields, static fn ($field): bool => $field !== 'attachments')
        ));
    }

    private function updateFields(callable $callback): void
    {
        $page = Page::query()
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'production_inquiry')
            ->where('slug', 'production-inquiry')
            ->first();

        $section = $page?->sections()
            ->whereIn('section_type', ['inquiry_form', 'contact_form'])
            ->first();

        if (! $section) {
            return;
        }

        $content = $section->content ?? [];
        $content['fields'] = $callback(array_values($content['fields'] ?? []));
        $section->update(['content' => $content]);
    }
};
