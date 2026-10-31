<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\AboutCta\UpdateAboutCtaRequest;
use App\Http\Resources\Admin\AdminAboutCtaResource;
use App\Models\AboutCta;
use App\Services\Cache;
use Illuminate\Http\JsonResponse;

class AdminAboutCtaController extends BaseController
{
    public function __construct(private readonly Cache $cache) {}

    public function show(string $siteType): JsonResponse
    {
        if (! in_array($siteType, AboutCta::SUPPORTED_SITE_TYPES, true)) {
            return $this->unsupportedSiteType($siteType, 404);
        }

        $aboutCta = AboutCta::query()->where('site_type', $siteType)->first();
        if ($aboutCta === null) {
            return $this->responseError(404, "About CTA has not been configured for site type {$siteType}.", [
                'site_type' => ["No About CTA configuration exists for {$siteType}."],
            ]);
        }

        return $this->responseSuccess(200, 'About CTA retrieved successfully.', [
            'about_cta' => new AdminAboutCtaResource($aboutCta),
        ]);
    }

    public function update(UpdateAboutCtaRequest $request, string $siteType): JsonResponse
    {
        if (! in_array($siteType, AboutCta::SUPPORTED_SITE_TYPES, true)) {
            return $this->unsupportedSiteType($siteType, 422);
        }

        $aboutCta = AboutCta::query()->where('site_type', $siteType)->first();
        if ($aboutCta === null) {
            return $this->responseError(404, "About CTA has not been configured for site type {$siteType}.", [
                'site_type' => ["No About CTA configuration exists for {$siteType}."],
            ]);
        }

        $content = $request->validated('content');
        if (is_array($content) && array_key_exists('item', $content)) {
            $aboutCtaContent = $aboutCta->content ?? [];
            $aboutCtaContent['item'] = $content['item'] ?? [];

            $aboutCta->update(['content' => $aboutCtaContent]);
        }

        $this->cache->invalidate('pages');

        return $this->responseSuccess(200, 'About CTA items updated successfully.', [
            'about_cta' => new AdminAboutCtaResource($aboutCta),
        ]);
    }

    private function unsupportedSiteType(string $siteType, int $status): JsonResponse
    {
        return $this->responseError($status, "About CTA is not supported for site type {$siteType}.", [
            'site_type' => [
                'About CTA is only available for BRAND_SITE and SHOPPING_MALL.',
            ],
        ]);
    }
}
