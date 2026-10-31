<?php

namespace App\Http\Controllers\Api;

use App\Services\BankAccountSettingService;
use Illuminate\Http\JsonResponse;

class BankAccountController extends BaseController
{
    public function __construct(protected BankAccountSettingService $service) {}

    public function show(): JsonResponse
    {
        return $this->responseSuccess(200, '계좌 정보를 조회했습니다.', [
            'bank_account' => $this->service->get(),
        ]);
    }
}
