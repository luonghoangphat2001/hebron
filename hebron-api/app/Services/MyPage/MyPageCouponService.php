<?php

namespace App\Services\MyPage;

use App\Http\Resources\CouponResource;
use App\Http\Resources\UserCouponResource;
use App\Models\Coupon;
use App\Models\User;
use App\Models\UserCoupon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageCouponService
{
    /**
     * Get user's coupons with filters
     */
    public function getUserCoupons(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        try {
            $query = UserCoupon::forUser($user->id)
                ->with(['coupon'])
                ->orderBy('received_at', 'desc');

            // Filter by status
            if (isset($filters['status']) && in_array($filters['status'], ['available', 'used', 'expired'])) {
                $query->byStatus($filters['status']);
            }

            // Filter available coupons only
            if (isset($filters['available_only']) && $filters['available_only']) {
                $query->available();
            }

            $userCoupons = $query->paginate($perPage);

            // Transform to resource
            $userCoupons->getCollection()->transform(function ($item) {
                // Check if coupon is expired and update status
                if ($item->status === 'available' && $item->coupon && $item->coupon->expires_at && $item->coupon->expires_at->isPast()) {
                    $item->update(['status' => 'expired']);
                    $item->refresh();
                }

                return new UserCouponResource($item);
            });

            return $userCoupons;
        } catch (\Exception $e) {
            Log::error('Get user coupons failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get available coupons (coupons user can receive)
     */
    public function getAvailableCoupons(User $user, int $perPage = 20): LengthAwarePaginator
    {
        try {
            // Get all valid coupons
            $coupons = Coupon::valid()
                ->whereDoesntHave('userCoupons', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            // Transform to resource
            $coupons->getCollection()->transform(function ($item) {
                return new CouponResource($item);
            });

            return $coupons;
        } catch (\Exception $e) {
            Log::error('Get available coupons failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Claim a coupon for user
     */
    public function claimCoupon(User $user, int $couponId): UserCoupon
    {
        try {
            DB::beginTransaction();

            $coupon = Coupon::findOrFail($couponId);

            // Check if coupon is valid
            if (! $coupon->isValid()) {
                throw new \Exception('쿠폰을 받을 수 없습니다. (만료되었거나 비활성화된 쿠폰입니다)');
            }

            // Check if user already has this coupon
            $existingUserCoupon = UserCoupon::where('user_id', $user->id)
                ->where('coupon_id', $couponId)
                ->first();

            if ($existingUserCoupon) {
                throw new \Exception('이미 받은 쿠폰입니다.');
            }

            // Create user coupon
            $userCoupon = UserCoupon::create([
                'user_id' => $user->id,
                'coupon_id' => $couponId,
                'received_at' => now(),
                'status' => 'available',
            ]);

            DB::commit();

            // Load relationships
            $userCoupon->load('coupon');

            return $userCoupon;
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            throw new \Exception('쿠폰을 찾을 수 없습니다.', 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Claim coupon failed', [
                'user_id' => $user->id,
                'coupon_id' => $couponId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get benefits information for user
     */
    public function getBenefits(User $user): array
    {
        try {
            $availableCouponsCount = UserCoupon::forUser($user->id)
                ->available()
                ->count();

            $usedCouponsCount = UserCoupon::forUser($user->id)
                ->byStatus('used')
                ->count();

            $totalCouponsCount = UserCoupon::forUser($user->id)->count();

            // Get available coupons to claim
            $availableToClaimCount = Coupon::valid()
                ->whereDoesntHave('userCoupons', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->count();

            return [
                'available_coupons' => $availableCouponsCount,
                'used_coupons' => $usedCouponsCount,
                'total_coupons' => $totalCouponsCount,
                'available_to_claim' => $availableToClaimCount,
                // Future: Add loyalty points, membership tier, etc.
            ];
        } catch (\Exception $e) {
            Log::error('Get benefits failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
