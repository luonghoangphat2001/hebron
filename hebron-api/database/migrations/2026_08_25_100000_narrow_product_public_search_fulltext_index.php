<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Product lookup searches product identity fields, not the large HTML
     * detail body. This makes the ngram index substantially smaller and
     * prevents generic HTML/URL tokens from matching unrelated products.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Fresh installations already receive the narrow index in the previous
        // migration. Existing installations may still have description indexed.
        if (! $this->indexIncludesDescription()) {
            return;
        }

        DB::statement('ALTER TABLE products DROP INDEX products_public_search_fulltext');
        DB::statement(
            'ALTER TABLE products ADD FULLTEXT INDEX products_public_search_fulltext '
            . '(name, name_en, sku, short_description) WITH PARSER ngram'
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE products DROP INDEX products_public_search_fulltext');
        DB::statement(
            'ALTER TABLE products ADD FULLTEXT INDEX products_public_search_fulltext '
            . '(name, name_en, sku, short_description, description) WITH PARSER ngram'
        );
    }

    private function indexIncludesDescription(): bool
    {
        return DB::table('information_schema.statistics')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_name', 'products')
            ->where('index_name', 'products_public_search_fulltext')
            ->where('column_name', 'description')
            ->exists();
    }
};
