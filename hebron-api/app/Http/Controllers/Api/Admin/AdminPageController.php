<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\SiteType;
use App\Enums\PageType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Page\StorePageRequest;
use App\Http\Requests\Admin\Page\UpdatePageRequest;
use App\Http\Resources\Admin\AdminPageResource;
use App\Models\Page;
use App\Services\PageDataAssembler;
use App\Services\Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminPageController extends BaseController
{
    public function __construct(
        private readonly PageDataAssembler $pageDataAssembler,
        private readonly Cache $cache,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $parameters = array_filter(
            $request->only(['site_type', 'page_type']),
            static fn ($value) => $value !== null && $value !== ''
        );
        $cacheKey = sha1(json_encode($parameters, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        $pages = $this->cache->remember('pages', 'admin:'.$cacheKey, config('services.cache.admin_page_ttl'), function () use ($request) {
            $query = Page::query()->with('sections')->orderBy('sort_order');

            if ($request->filled('site_type')) {
                $query->ofSite($request->input('site_type'));
            }

            if ($request->filled('page_type')) {
                $query->where('page_type', $request->input('page_type'));
            }

            $pages = $query->get();
            $pages->each(fn (Page $page) => $this->pageDataAssembler->assembleAdminPage($page));

            return AdminPageResource::collection($pages)->resolve();
        });

        return $this->responseSuccess(200, 'Pages retrieved successfully.', ['pages' => $pages]);
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $page = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $sections = $data['sections'] ?? [];
            unset($data['sections']);
            $data['site_type'] ??= SiteType::BRAND_SITE->value;

            $page = Page::create($data);
            $this->syncSections($page, $sections);

            return $page->load('sections');
        });

        $this->pageDataAssembler->assemble($page);
        $this->cache->invalidate('pages');

        return $this->responseSuccess(201, 'Page created successfully.', [
            'page' => new AdminPageResource($page),
        ]);
    }

    public function update(UpdatePageRequest $request, int $id): JsonResponse
    {
        $page = DB::transaction(function () use ($request, $id) {
            $page = Page::findOrFail($id);
            $data = $request->validated();
            $sections = $data['sections'] ?? null;
            unset($data['sections']);

            $page->update($data);
            if ($sections !== null) {
                $this->syncSections($page, $sections);
            }

            return $page->fresh()->load('sections');
        });

        $this->pageDataAssembler->assemble($page);
        $this->cache->invalidate('pages');

        return $this->responseSuccess(200, 'Page updated successfully.', [
            'page' => new AdminPageResource($page),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Page::findOrFail($id)->delete();
        $this->cache->invalidate('pages');

        return $this->responseSuccess(200, 'Page deleted.');
    }

    private function syncSections(Page $page, array $sections): void
    {
        $keep = [];

        foreach ($sections as $section) {
            $sectionId = $section['id'] ?? null;
            if (array_key_exists('sort_order', $section)) {
                $currentSortOrder = $sectionId
                    ? $page->sections()->whereKey($sectionId)->value('sort_order')
                    : null;

                Log::warning('Ignored admin page bulk section sort_order update.', [
                    'page_id' => $page->id,
                    'page_slug' => $page->slug,
                    'site_type' => $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type,
                    'page_type' => $page->page_type instanceof PageType ? $page->page_type->value : $page->page_type,
                    'section_id' => $sectionId,
                    'section_type' => $section['section_type'] ?? null,
                    'current_sort_order' => $currentSortOrder,
                    'requested_sort_order' => $section['sort_order'],
                    'user_id' => request()->user()?->id,
                    'ip' => request()->ip(),
                ]);
            }
            unset($section['id']);
            unset($section['sort_order']);

            $model = $sectionId
                ? $page->sections()->whereKey($sectionId)->firstOrFail()
                : $page->sections()->make();

            $model->fill($section);
            $page->sections()->save($model);
            $keep[] = $model->id;
        }

        if ($sections !== []) {
            $page->sections()->whereNotIn('id', $keep)->delete();
        }
    }

}
