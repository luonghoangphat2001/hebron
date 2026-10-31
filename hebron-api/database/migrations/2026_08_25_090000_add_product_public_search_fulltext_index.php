<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The ngram parser is required for Korean/CJK full-text tokenization.
     * MySQL's default ngram_token_size is 2; if the server configuration is
     * changed, this index must be rebuilt after the change.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement(
            'ALTER TABLE products ADD FULLTEXT INDEX products_public_search_fulltext '
            . '(name, name_en, sku, short_description, description) WITH PARSER ngram'
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE products DROP INDEX products_public_search_fulltext');
    }
};
