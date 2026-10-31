<?php

namespace App\Http\Controllers\Api;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Enums\SiteType;
use App\Http\Requests\Brand\StoreProductionInquiryRequest;
use App\Http\Resources\InquiryResource;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductionInquiryController extends BaseController
{
    public function storeProduction(StoreProductionInquiryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $inquiry = $this->createInquiry(
            $request,
            $data,
            'brand_production_inquiry',
            InquiryCategory::PRODUCT,
            ' 제작 문의',
            [
                'deadline' => $data['deadline'],
            ],
            [
                'product_type' => $data['product_type'],
                'site_type' => $data['site_type'],
                'quantity_type' => $data['quantity_type'],
                'budget_type' => $data['budget_type'],
            ],
            $data['product_id'] ?? null,
        );

        return $this->responseSuccess(201, '제작 문의가 성공적으로 등록되었습니다.', [
            'inquiry' => new InquiryResource($inquiry),
        ]);
    }

    protected function createInquiry(
        Request $request,
        array $data,
        string $source,
        InquiryCategory $category,
        string $titleSuffix,
        array $additionalLegacyData = [],
        array $additionalAttributes = [],
        ?int $productId = null,
    ): Inquiry {
        return DB::transaction(function () use ($request, $data, $source, $category, $titleSuffix, $additionalLegacyData, $additionalAttributes, $productId) {

            $inquiry = Inquiry::create([
                'user_id' => null,
                'product_id' => $productId,
                'category' => $category,
                'title' => $data['company_name'] . $titleSuffix,
                'content' => $data['message'],
                'contact' => $data['phone'],
                'status' => InquiryStatus::PENDING,
                'site_type' => $data['site_type'] ?? SiteType::BRAND_SITE,
                ...$additionalAttributes,
                ...[
                    'company_name' => $data['company_name'] ?? null,
                    'manager_name' => $data['manager_name'] ?? null,
                    'email' => $data['email'] ?? null,
                    ...$additionalLegacyData,
                ],
            ]);

            foreach ($data['attachments'] ?? [] as $attachment) {
                if (empty($attachment['file_path'])) {
                    continue;
                }

                InquiryAttachment::create([
                    'inquiry_id' => $inquiry->id,
                    'file_path' => $attachment['file_path'],
                    'file_name' => $attachment['file_name'] ?? basename($attachment['file_path']),
                    'file_size' => $attachment['file_size'] ?? null,
                    'file_type' => $attachment['file_type'] ?? null,
                ]);
            }

            return $inquiry->load(['attachments', 'user', 'product']);
        });
    }
}
