<?php

namespace App\Migration\ExampleSentenceSamples\Importers;

use App\Enums\PostCategoryPageType;
use App\Migration\ExampleSentenceSamples\DTO\ExampleSentenceSampleImportData;
use App\Models\ExampleSentenceSample;
use App\Services\PostCategoryService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExampleSentenceSamplesImporter
{
    public function __construct(private readonly PostCategoryService $categories) {}

    public function import(ExampleSentenceSampleImportData $dto): ExampleSentenceSample
    {
        if (config('migration.dry_run')) {
            return new ExampleSentenceSample(['id' => 0]);
        }

        return DB::transaction(function () use ($dto): ExampleSentenceSample {
            $createdAt = $dto->createdDate
                ? Carbon::parse($dto->createdDate)->format('Y-m-d H:i:s')
                : null;
            $sample = ExampleSentenceSample::query()
                ->where('title', $dto->title)
                ->when($createdAt, fn ($query) => $query->where('created_at', $createdAt))
                ->first() ?? new ExampleSentenceSample;

            $sample->fill([
                'title' => $dto->title,
                'board_category_no' => $dto->boardCategoryNo,
                'content' => $dto->content,
                'attachments' => $dto->attachments,
                'is_active' => $dto->isActive,
                'is_featured' => $dto->isFeatured,
                'view_count' => $dto->viewCount,
            ]);

            if (! $sample->exists && $createdAt) {
                $sample->forceFill(['created_at' => $createdAt]);
            }

            $sample->save();

            $this->categories->attachImported(
                $sample,
                PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value,
                $dto->boardCategoryNo,
            );

            return $sample;
        });
    }
}
