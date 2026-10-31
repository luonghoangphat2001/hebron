<?php

use App\Models\Media;
use App\Models\Portfolio;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('board_category_no')->nullable();
            $table->string('name', 100);
            $table->string('page_type', 50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['page_type', 'board_category_no']);
            $table->index(['page_type', 'is_active']);
        });

        Schema::create('category_post', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('post_categories')->cascadeOnDelete();
            $table->unsignedBigInteger('subject_id');
            $table->string('subject_type', 50);
            $table->timestamps();

            $table->unique(['category_id', 'subject_type', 'subject_id']);
            $table->index(['subject_type', 'subject_id']);
        });

        $this->migrateLegacyMediaCategories();
        $this->migrateLegacyPortfolioCategories();

        if (Schema::hasColumn('media', 'category_id')) {
            Schema::table('media', fn (Blueprint $table) => $table->unsignedBigInteger('category_id')->nullable()->change());
        }

        Schema::dropIfExists('example_sentence_sample_categories');
    }

    public function down(): void
    {
        Schema::dropIfExists('category_post');
        Schema::dropIfExists('post_categories');
    }

    private function migrateLegacyMediaCategories(): void
    {
        if (! Schema::hasTable('media_categories') || ! Schema::hasColumn('media', 'category_id')) {
            return;
        }

        DB::table('media')
            ->join('media_categories', 'media_categories.id', '=', 'media.category_id')
            ->select('media.id as subject_id', 'media_categories.name')
            ->orderBy('media.id')
            ->each(function (object $row): void {
                $categoryId = $this->legacyCategoryId('media', $row->name);
                $this->attachLegacyCategory($categoryId, Media::class, $row->subject_id);
            });
    }

    private function migrateLegacyPortfolioCategories(): void
    {
        if (! Schema::hasColumn('portfolios', 'category')) {
            return;
        }

        DB::table('portfolios')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->select('id as subject_id', 'category as name')
            ->orderBy('id')
            ->each(function (object $row): void {
                $categoryId = $this->legacyCategoryId('portfolio', $row->name);
                $this->attachLegacyCategory($categoryId, Portfolio::class, $row->subject_id);
            });
    }

    private function legacyCategoryId(string $pageType, string $name): int
    {
        $name = mb_substr(trim($name), 0, 100);
        $existing = DB::table('post_categories')
            ->where('page_type', $pageType)
            ->where('name', $name)
            ->value('id');

        return $existing ?: DB::table('post_categories')->insertGetId([
            'board_category_no' => null,
            'name' => $name,
            'page_type' => $pageType,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function attachLegacyCategory(int $categoryId, string $subjectType, int $subjectId): void
    {
        DB::table('category_post')->insertOrIgnore([
            'category_id' => $categoryId,
            'subject_id' => $subjectId,
            'subject_type' => $subjectType,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
