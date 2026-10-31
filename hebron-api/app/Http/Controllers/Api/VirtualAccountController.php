<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Services\VirtualAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VirtualAccountController extends BaseController
{
    public function __construct(
        protected VirtualAccountService $virtualAccountService,
    ) {}

    /**
     * Get virtual accounts for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $virtualAccounts = $this->virtualAccountService->getMyVirtualAccounts($user->id);

            return $this->responseSuccess(200, 'Virtual accounts retrieved successfully.', [
                "virtual_account" => $virtualAccounts
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve virtual accounts for user: ' . $user->id, ['error' => $e->getMessage()]);
            return $this->responseError(500, 'An error occurred while retrieving virtual accounts.', $e->getMessage());
        }
    }

    /**
     * Create a virtual account for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'bank_code' => 'required|string|max:20',
            ]);

            $user = $request->user();

            $data = [
                'bank_code' => $validatedData['bank_code']
            ];

            $virtualAccount = $this->virtualAccountService->createVirtualAccount($user, $data);

            return $this->responseSuccess(201, 'Virtual account created successfully', $virtualAccount);
        } catch (\Exception $e) {
            Log::error('Failed to create virtual account for user: ' . $request->user()->id, ['error' => $e->getMessage()]);
            return $this->responseError(500, 'An error occurred while creating virtual account', $e->getMessage());
        }
    }
    /**
     * Update a virtual account for the authenticated user.
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'bank_code' => 'required|string|max:20',
            ]);

            $user = $request->user();

            $data = [
                'bank_code' => $validatedData['bank_code']
            ];

            $virtualAccount = $this->virtualAccountService->updateVirtualAccount($user, $data);

            if (! $virtualAccount) {
                return $this->responseError(404, 'Virtual account not found or unauthorized.');
            }

            return $this->responseSuccess(200, 'Virtual account updated successfully', $virtualAccount);
        } catch (\Exception $e) {
            Log::error('Failed to update virtual account for user: ' . $request->user()->id, ['error' => $e->getMessage()]);
            return $this->responseError(500, 'An error occurred while updating virtual account', $e->getMessage());
        }
    }
}
