<?php

namespace App\Http\Controllers\Api;

use App\Enums\InquiryCategory;
use App\Http\Requests\ContactUs\StoreContactUsRequest;
use App\Http\Resources\InquiryResource;
use Illuminate\Http\JsonResponse;

class ContactUsController extends ProductionInquiryController
{
    public function store(StoreContactUsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $inquiry = $this->createInquiry(
            $request,
            $data,
            'brand_contact_us',
            InquiryCategory::CONTACT_US,
            ' 문의',
            [],
            [
                'product_type' => $data['product_type'],
                'site_type' => $data['site_type'],
            ],
        );

        return $this->responseSuccess(201, '문의가 성공적으로 등록되었습니다.', [
            'inquiry' => new InquiryResource($inquiry),
        ]);
    }
}
