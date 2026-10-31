<?php

namespace App\Services;

use App\Enums\PostCategoryPageType;
use App\Models\ExampleSentenceSample;
use App\Models\Faq;
use App\Models\Media;
use App\Models\Notice;
use App\Models\Portfolio;
use App\Models\PostCategory;
use Illuminate\Database\Eloquent\Model;

class PostCategoryService
{
    private const SUBJECT_MODELS = [
        PostCategoryPageType::NOTICE->value => Notice::class,
        PostCategoryPageType::FAQ->value => Faq::class,
        PostCategoryPageType::PORTFOLIO->value => Portfolio::class,
        PostCategoryPageType::MEDIA->value => Media::class,
        PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value => ExampleSentenceSample::class,
    ];

    public static function subjectTypes(): array
    {
        return PostCategoryPageType::values();
    }

    public function subject(string $subjectType, int $subjectId): Model
    {
        $model = self::SUBJECT_MODELS[$subjectType] ?? null;
        abort_unless($model, 422, 'Unsupported subject type.');

        return $model::query()->findOrFail($subjectId);
    }

    public function category(string $subjectType, int $subjectId): ?PostCategory
    {
        return $this->subject($subjectType, $subjectId)->categories()->first();
    }

    public function assign(string $subjectType, int $subjectId, PostCategory $category): PostCategory
    {
        abort_unless($category->page_type === $subjectType, 422, 'Category does not belong to this page type.');

        $subject = $this->subject($subjectType, $subjectId);
        $subject->categories()->sync([$category->id]);
        $this->syncLegacyCategory($subject, $category);
        $subject->unsetRelation('categories');

        return $category;
    }

    public function detach(string $subjectType, int $subjectId): void
    {
        $subject = $this->subject($subjectType, $subjectId);
        $subject->categories()->detach();
        $this->syncLegacyCategory($subject, null);
        $subject->unsetRelation('categories');
    }

    public function import(string $pageType, array $categories): void
    {
        if (config('migration.dry_run')) {
            return;
        }

        foreach ($categories as $category) {
            $postCategory = PostCategory::withTrashed()->updateOrCreate(
                ['page_type' => $pageType, 'board_category_no' => $category['board_category_no']],
                ['name' => $category['name'], 'is_active' => true],
            );
            $postCategory->restore();
        }
    }

    public function attachImported(Model $subject, string $pageType, int $boardCategoryNo): void
    {
        if ($boardCategoryNo <= 0) {
            return;
        }

        $category = PostCategory::query()
            ->where('page_type', $pageType)
            ->where('board_category_no', $boardCategoryNo)
            ->first();

        if ($category) {
            $subject->categories()->sync([$category->id]);
            $this->syncLegacyCategory($subject, $category);
            $subject->unsetRelation('categories');
        }
    }

    public function syncLegacyCategoryName(PostCategory $category): void
    {
        Faq::query()
            ->whereKey($category->faqs()->pluck('faqs.id'))
            ->update(['category' => $category->name]);
        Portfolio::query()
            ->whereKey($category->portfolios()->pluck('portfolios.id'))
            ->update(['category' => $category->name]);
    }

    private function syncLegacyCategory(Model $subject, ?PostCategory $category): void
    {
        if ($subject instanceof Faq || $subject instanceof Portfolio) {
            $subject->forceFill(['category' => $category?->name])->saveQuietly();
        }
    }
}
