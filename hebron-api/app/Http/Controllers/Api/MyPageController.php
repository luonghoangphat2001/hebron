<?php

namespace App\Http\Controllers\Api;

use App\Enums\FileType;
use App\Enums\MemberType;
use App\Http\Controllers\Controller;
use App\Http\Requests\MyPage\UpdatePasswordRequest;
use App\Http\Requests\MyPage\UpdateProfileRequest;
use App\Services\Cache;
use App\Services\FileService;
use App\Services\MembershipService;
use App\Services\MyPageDashboardService;
use App\Services\PointBalanceService;
use App\Services\ProfileService;
use App\Services\VirtualAccountService;
use App\Services\WalletService;
use App\Support\FileStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class MyPageController extends Controller
{
    public function __construct(
        protected ProfileService $profileService,
        protected MyPageDashboardService $dashboardService,
        protected FileService $fileService,
        protected MembershipService $membershipService,
        protected PointBalanceService $pointBalanceService,
        protected WalletService $walletService,
        protected VirtualAccountService $virtaulAccountService,
        protected Cache $cache,
    ) {}

    /**
     * Get current user profile
     * GET /api/mypage/profile
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => $this->profileService->formatUserData($user, true),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get profile failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '프로필 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user profile
     * PUT /api/mypage/profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            // Update profile
            $updatedUser = $this->profileService->updateProfile($user, $validated);
            $this->cache->invalidate('mypage_u:'.$user->id);

            return response()->json([
                'success' => true,
                'message' => '프로필이 성공적으로 업데이트되었습니다.',
                'data' => [
                    'profile' => $this->profileService->formatUserData($updatedUser, true),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update profile failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '프로필 업데이트 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user password
     * PUT /api/mypage/profile/password
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            // Update password
            $this->profileService->updatePassword(
                $user,
                $validated['current_password'],
                $validated['new_password']
            );
            $this->cache->invalidate('mypage_u:'.$user->id);

            return response()->json([
                'success' => true,
                'message' => '비밀번호가 성공적으로 변경되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update password failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            $statusCode = 422;
            $message = '비밀번호 변경 중 오류가 발생했습니다.';

            // If it's a validation error (current password mismatch)
            if (str_contains($e->getMessage(), '현재 비밀번호')) {
                $statusCode = 400;
                $message = $e->getMessage();
            }

            return response()->json([
                'success' => false,
                'message' => $message,
                'error' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Upload business registration file (사업자등록증 업로드)
     * POST /api/mypage/profile/business-registration-file
     */
    public function uploadBusinessRegistrationFile(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            ]);

            $user = $request->user();

            if ($user->member_type !== MemberType::BUSINESS) {
                return response()->json([
                    'success' => false,
                    'message' => '기업 회원만 사업자등록증을 업로드할 수 있습니다.',
                ], 403);
            }

            $path = $request->file('file')->store('customers/business-registration', config('filesystems.public_disk'));
            $url = FileStorage::publicUrl($path);
            $this->fileService->create($request->file('file'), $path, FileType::CUSTOMER_BUSINESS_REGISTRATION, $request->user());
            // Save path to customer record
            $user->update(['business_registration_file' => $path]);
            $this->cache->invalidate('mypage_u:'.$user->id);

            return response()->json([
                'success' => true,
                'message' => '사업자등록증이 업로드되었습니다.',
                'data' => [
                    'file_path' => $path,
                    'file_url' => $url,
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '파일 형식이 올바르지 않습니다.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Upload business registration file failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '파일 업로드 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get MyPage dashboard data
     * GET /api/mypage/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $dashboardData = $this->dashboardService->getDashboardData($user);

            return response()->json([
                'success' => true,
                'data' => $dashboardData,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get MyPage dashboard failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '대시보드 데이터를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
