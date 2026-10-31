<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\BankAccount\UpsertBankAccountRequest;
use App\Services\BankAccountSettingService;
use Illuminate\Http\JsonResponse;

class AdminBankAccountController extends BaseController
{
    public function __construct(protected BankAccountSettingService $service) {}

    public function show(): JsonResponse
    {
        return $this->responseSuccess(200, '계좌 정보를 조회했습니다.', [
            'bank_account' => $this->service->get(),
        ]);
    }

    public function update(UpsertBankAccountRequest $request): JsonResponse
    {
        return $this->responseSuccess(200, '계좌 정보가 저장되었습니다.', [
            'bank_account' => $this->service->upsert($request->validated()),
        ]);
    }
}
