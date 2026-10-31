<?php

namespace App\Services;

use App\Enums\MemberType;
use App\Enums\UserAuthority;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ProfileService
{
    /**
     * Format user data for API response
     */
    public function formatUserData(User $user, bool $includeAgreedAt = false): array
    {
        $authorityEnum = $user->getAuthorityEnum();

        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'mobile' => $user->mobile,
            'postcode' => $user->postcode,
            'address' => $user->address,
            'detailed_address' => $user->detailed_address,
            'authority' => $user->authority,
            'role' => $user->authority, // Alias for authority (for FE convenience)
            'is_admin' => $authorityEnum?->isAdmin() ?? false,
            'is_super_admin' => $authorityEnum?->isSuperAdmin() ?? false,
            'is_store_admin' => $user->isStoreAdmin(),
            'is_normal_user' => $authorityEnum === UserAuthority::USER,

            // Permissions and Approval Information (권한 및 결재정보)
            'permission' => match ($authorityEnum) {
                UserAuthority::SUPER_ADMIN => '슈퍼 관리자',
                UserAuthority::STORE_ADMIN => '매장 관리자',
                UserAuthority::USER => '일반회원',
                default => $user->authority ?? '일반회원',
            },
            'individual_approval' => $user->individual_approval ?? false,
            'approval_line' => $user->approval_line ?? [],

            // Agreements
            'agree_sms' => (bool) ($user->agree_sms ?? false),
            'agree_email' => (bool) ($user->agree_email ?? false),

            // Member type
            'member_type' => $user->member_type,

            //Bussiness
            'company_name' => $user->company_name,
            'business_registration_number' => $user->business_registration_number,
            'representative_name' => $user->representative_name,
            'business_type' => $user->business_type,
            'industry_type' => $user->industry_type,
            'business_postcode' => $user->postcode,
            'business_address' => $user->address,
            'business_address_detail' => $user->detailed_address,
            'tax_invoice_email' => $user->tax_invoice_email,
            'homepage_url' => $user->homepage_url,
            'business_registration_file' => $user->business_registration_file,
        ];

        if ($includeAgreedAt) {
            $data['agreed_at'] = $user->agreed_at;
        }

        return $data;
    }

    /**
     * Update user profile
     *
     * @throws \Exception
     */
    public function updateProfile(User $user, array $data): User
    {
        try {
            // Prepare update data
            $updateData = [];

            // Basic Information (기본 정보)
            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['email'])) {
                $updateData['email'] = $data['email'];
            }
            if (isset($data['phone'])) {
                $updateData['phone'] = $data['phone'];
            }
            if (isset($data['mobile'])) {
                $updateData['mobile'] = $data['mobile'];
            }

            // Address Information (주소 정보)
            if (isset($data['postcode'])) {
                $updateData['postcode'] = $data['postcode'];
            }
            if (isset($data['address'])) {
                $updateData['address'] = $data['address'];
            }
            if (isset($data['detailed_address'])) {
                $updateData['detailed_address'] = $data['detailed_address'];
            }

            // Bussiness Information
            $customerFields = [
                'business_registration_number',
                'company_name',
                'representative_name',
                'industry_type',
                'business_type',
                'business_postcode',
                'business_address',
                'business_address_detail',
                'tax_invoice_email',
                'homepage_url',
                'business_registration_file',
            ];
            foreach ($customerFields as $field) {
                if (isset($data[$field])) {
                    $updateData[$field] = $data[$field];
                }
            }

            // Agreements (수신동의)
            if (isset($data['agree_sms'])) {
                $updateData['agree_sms'] = $data['agree_sms'];
            }
            if (isset($data['agree_email'])) {
                $updateData['agree_email'] = $data['agree_email'];
            }

            // Update user
            $user->update($updateData);

            // Refresh user to get latest data
            return $user->fresh();
        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update user password
     *
     * @throws \Exception
     */
    public function updatePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        try {
            // Verify current password
            if (!Hash::check($currentPassword, $user->password)) {
                throw new \Exception('현재 비밀번호가 일치하지 않습니다.');
            }

            // Check if new password is different from current password
            if (Hash::check($newPassword, $user->password)) {
                throw new \Exception('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
            }

            // Update password
            $user->update([
                'password' => Hash::make($newPassword),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Password update failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
