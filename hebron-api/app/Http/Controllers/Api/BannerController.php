<?php

namespace App\Http\Controllers\Api;

use App\Enums\PageType;
use App\Enums\SiteType;
use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    /**
     * Brand banners. Same response/resource format as the public banner APIs,
     * but scoped to active BRAND_SITE banners.
     */
    public function brand(): JsonResponse
    {
        try {
            $banners = Banner::visible()
                ->where('site_type', SiteType::BRAND_SITE->value)
                ->where('page_type', PageType::PORTFOLIO->value)
                ->where('exposure_location', 'main_hero')
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'banners' => BannerResource::collection($banners),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load brand banners.',
            ], 500);
        }
    }

    /**
     * Homepage banners (공통 배너 - 홈 화면).
     */
    public function homepage(): JsonResponse
    {
        try {
            $banners = Banner::visible()
                ->where('exposure_location', 'main_hero')
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    // Use ::collection() to handle the array of banners properly
                    'banners' => BannerResource::collection($banners),
                ],
            ]);
        } catch (\Throwable $e) {
            // Tip: Log $e->getMessage() here during development to see internal errors!
            return response()->json([
                'success' => false,
                'message' => 'Failed to load homepage banners.',
            ], 500);
        }
    }

    /**
     * Login modal banners (로그인 모달 배너).
     */
    public function login(): JsonResponse
    {
        try {
            $banner = Banner::visible()
                ->where('exposure_location', 'login')
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'banners' => $banner ? [new BannerResource($banner)] : [],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load login banners.',
            ], 500);
        }
    }
}
