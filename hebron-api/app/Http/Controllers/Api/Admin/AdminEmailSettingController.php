<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\EmailSetting\UpdateEmailSettingRequest;
use App\Http\Resources\Admin\AdminEmailSettingResource;
use App\Mail\AdminTestMail;
use App\Models\EmailSetting;
use App\Services\EmailSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminEmailSettingController extends BaseController
{
    public function __construct(
        protected EmailSettingService $emailSettingService,
    ) {}

    public function show(): JsonResponse
    {
        try {
            $settings = $this->emailSettingService->getSettings();

            return $this->responseSuccess(
                200,
                '이메일 설정 조회 성공',
                new AdminEmailSettingResource($settings)
            );
        } catch (\Throwable $e) {
            Log::error('Get email settings failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '이메일 설정 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function update(UpdateEmailSettingRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $settings = $this->emailSettingService->updateSettings($validated);

            return $this->responseSuccess(
                200,
                '이메일 설정이 성공적으로 저장되었습니다.',
                new AdminEmailSettingResource($settings)
            );
        } catch (\Throwable $e) {
            Log::error('Update email settings failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '이메일 설정 저장 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function sendTestEmail(Request $request): JsonResponse
    {
        try {
            $settings = EmailSetting::getOrCreate();
            $recipients = $settings->getEffectiveReceiverEmails();

            if (empty($recipients)) {
                return $this->responseError(422, '설정된 수신자 이메일 주소가 없습니다.');
            }

            $senderEmail = $settings->getEffectiveSenderEmail();
            $senderName = $settings->getEffectiveSenderName();

            Mail::to($recipients)->send(new AdminTestMail);

            return $this->responseSuccess(200, '테스트 이메일이 성공적으로 발송되었습니다.', [
                'recipients' => $recipients,
                'sender' => [
                    'email' => $senderEmail,
                    'name' => $senderName,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Send test email failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '테스트 이메일 발송 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
