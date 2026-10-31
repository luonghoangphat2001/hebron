<?php

namespace App\Http\Controllers\Api;

use App\Enums\SiteType;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Services\PageDataAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PageController extends BaseController
{
    public function __construct(private readonly PageDataAssembler $pageDataAssembler) {}

    public function show(string $slug, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_type' => ['nullable', Rule::enum(SiteType::class)],
        ]);

        $siteType = isset($validated['site_type'])
            ? SiteType::from($validated['site_type'])
            : null;

        return $this->showForSite($slug, $siteType);
    }

    public function showBrand(string $slug): JsonResponse
    {
        return $this->showForSite($slug, SiteType::BRAND_SITE);
    }

    public function showVendor(string $slug): JsonResponse
    {
        return $this->showForSite($slug, SiteType::PLAIN_SITE);
    }

    private function showForSite(string $slug, ?SiteType $siteType = null): JsonResponse
    {
        $query = Page::active();

        if ($siteType !== null) {
            $query->ofSite($siteType);
        }

        $page = $query
            ->with(['sections' => fn ($q) => $q->active()->ordered()])
            ->where('slug', $slug)
            ->first();

        if ($page === null) {
            $siteLabel = $siteType?->value ?? 'ANY';

            return $this->responseError(
                404,
                "Page not found for slug '{$slug}' and site type '{$siteLabel}'.",
                [
                    'slug' => ["The slug '{$slug}' does not match an active page."],
                    'site_type' => [$siteLabel],
                ]
            );
        }

        $this->pageDataAssembler->assemble($page);

        return $this->responseSuccess(200, 'Page retrieved successfully.', [
            'page' => new PageResource($page),
        ]);
    }
}
