<?php

use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $this->setEndpoint('/api/brand/contact-us');
    }

    public function down(): void
    {
        $this->setEndpoint('/api/brand/production-inquiry');
    }

    private function setEndpoint(string $endpoint): void
    {
        $page = Page::query()
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'contact_us')
            ->first();
        $section = $page?->sections()->where('section_type', 'contact_form')->first();

        if (! $section) {
            return;
        }

        $content = $section->content ?? [];
        $content['submit_endpoint'] = $endpoint;
        $section->update(['content' => $content]);
    }
};
