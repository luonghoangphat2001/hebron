<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ExampleSentenceSample\AdminExampleSentenceSampleStoreRequest;
use App\Http\Requests\Admin\ExampleSentenceSample\AdminExampleSentenceSampleListRequest;
use App\Http\Requests\Admin\ExampleSentenceSample\AdminExampleSentenceSampleUpdateRequest;
use App\Http\Resources\Admin\AdminExampleSentenceSampleResource;
use App\Models\ExampleSentenceSample;
use App\Enums\PostCategoryPageType;
use App\Models\PostCategory;
use App\Services\PostCategoryService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminExampleSentenceSampleController extends BaseController
{
    public function __construct(
        private readonly PaginationService $paginationService,
        private readonly PostCategoryService $postCategories,
    ) {}

    public function index(AdminExampleSentenceSampleListRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $query = ExampleSentenceSample::query();

        if (! empty($filters['keyword'])) {
            $keyword = $filters['keyword'];
            $query->where(fn ($query) => $query
                ->where('title', 'like', "%{$keyword}%")
                ->orWhere('content', 'like', "%{$keyword}%"));
        }

        if (array_key_exists('board_category_no', $filters)) {
            $query->where('board_category_no', $filters['board_category_no']);
        }

        foreach (['is_active', 'is_featured'] as $field) {
            if (array_key_exists($field, $filters)) {
                $query->where($field, $filters[$field]);
            }
        }

        $paginator = $query->latest('id')->paginate((int) ($filters['per_page'] ?? 20));

        return $this->responsePaginatedSuccess(200, 'Example sentence samples retrieved successfully.', [
            'example_sentence_samples' => AdminExampleSentenceSampleResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }

    public function store(AdminExampleSentenceSampleStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $categoryId = $data['category_id'] ?? null;
        unset($data['category_id'], $data['category']);

        $sample = ExampleSentenceSample::query()->create($data);

        if ($categoryId !== null) {
            $this->postCategories->assign(
                PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value,
                $sample->id,
                PostCategory::query()->findOrFail($categoryId),
            );
        }

        return $this->responseSuccess(201, 'Example sentence sample created successfully.', [
            'example_sentence_sample' => new AdminExampleSentenceSampleResource($sample->fresh(['categories'])),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return $this->responseSuccess(200, 'Example sentence sample retrieved successfully.', [
            'example_sentence_sample' => new AdminExampleSentenceSampleResource(ExampleSentenceSample::findOrFail($id)),
        ]);
    }

    public function update(AdminExampleSentenceSampleUpdateRequest $request, int $id): JsonResponse
    {
        $sample = ExampleSentenceSample::findOrFail($id);
        $data = $request->validated();
        $hasCategory = array_key_exists('category_id', $data);
        $categoryId = $data['category_id'] ?? null;
        unset($data['category_id']);
        $sample->update($data);

        if ($hasCategory) {
            if ($categoryId === null) {
                $this->postCategories->detach(PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value, $sample->id);
            } else {
                $this->postCategories->assign(
                    PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value,
                    $sample->id,
                    PostCategory::query()->findOrFail($categoryId),
                );
            }
        }

        return $this->responseSuccess(200, 'Example sentence sample updated successfully.', [
            'example_sentence_sample' => new AdminExampleSentenceSampleResource($sample->fresh(['categories'])),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        ExampleSentenceSample::findOrFail($id)->delete();

        return $this->responseSuccess(200, 'Example sentence sample deleted successfully.');
    }
}
