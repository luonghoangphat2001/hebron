<?php

namespace App\Services\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\MemberType;
use App\Enums\UserStatus;
use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminMemberService
{
    public function __construct(
        protected MembershipService $membershipService,
    ) {}

    /**
     * Build query for members with filters.
     * This method is used by both getMembers and export.
     *
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = User::query();

        // Search term filter (검색어)
        if (! empty($filters['search_term'])) {
            $search = $filters['search_term'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Authority filter (권한)
        if (! empty($filters['authority'])) {
            $query->where('authority', $filters['authority']);
        }

        // Approval status filter (승인상태)
        if (! empty($filters['approval_status'])) {
            $query->where('approval_status', ApprovalStatus::from($filters['approval_status']));
        }

        // Status filter (상태)
        if (! empty($filters['status'])) {
            $query->where('status', UserStatus::from($filters['status']));
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }

    /**
     * Get members (users) with filters & pagination
     * 회원 목록 조회
     */
    public function getMembers(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single member detail by ID
     * 회원 상세 조회
     */
    public function getMember(int|string $id): User
    {
        $member = User::query()
            ->find($id);

        if (! $member) {
            throw new ModelNotFoundException('Member not found.');
        }

        return $member;
    }

    /**
     * Update member basic information
     * 회원 기본정보 업데이트
     */
    public function updateBasicInfo(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        if (empty($data)) {
            return $user;
        }

        $user->update($data);

        return $user;
    }

    /**
     * Get member permissions
     * 회원 권한 정보 조회
     */
    public function getPermissions(int|string $id): array
    {
        $member = $this->getMember($id);

        return [
            'availability' => [
                'value' => $member->status?->isActive() ?? false,
                'label' => $member->status?->isActive() ? '이용가능' : '이용불가',
            ],
            'authority' => [
                'value' => $member->authority,
                'label' => $this->getAuthorityLabel($member->authority ?? ''),
            ],
            'status' => [
                'value' => $member->status?->value,
                'label' => $this->getStatusLabel($member->status),
            ],
        ];
    }

    /**
     * Update member permissions
     * 회원 권한 정보 업데이트
     */
    public function updatePermissions(int|string $id, array $data, User $adminUser): User
    {
        $member = $this->getMember($id);

        $updateData = [];

        if (isset($data['approval_status'])) {
            $updateData['approval_status'] = ApprovalStatus::from($data['approval_status']);
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = $adminUser->id;
        }

        if (isset($data['status'])) {
            $updateData['status'] = UserStatus::from($data['status']);
        }

        if (isset($data['authority'])) {
            $updateData['authority'] = $data['authority'];
        }

        if (isset($data['membership_tier_id'])) {
            $oldTierName = $member->membershipTier?->name ?? 'None';
            $updateData['membership_tier_id'] = $data['membership_tier_id'];

            Log::info("Manual membership upgrade for user {$member->id}: {$oldTierName} -> Tier ID {$data['membership_tier_id']} (by admin {$adminUser->id})");
        }

        $member->update($updateData);

        return $member;
    }

    /**
     * Approve member
     * 회원 승인
     */
    public function approve(int|string $id, ?string $reason, User $adminUser): User
    {
        $member = $this->getMember($id);

        if (! $member->approval_status?->isPending()) {
            throw new \Exception('Member is not in pending status.');
        }

        $member->update([
            'approval_status' => ApprovalStatus::ACCEPTED,
            'approved_at' => now(),
            'approved_by' => $adminUser->id,
        ]);

        return $member;
    }

    /**
     * Reject member
     * 회원 거절
     */
    public function reject(int|string $id, string $reason, User $adminUser): User
    {
        $member = $this->getMember($id);

        $member->update([
            'approval_status' => ApprovalStatus::REJECTED,
            'approved_at' => now(),
            'approved_by' => $adminUser->id,
        ]);

        // TODO: Log rejection action with reason

        return $member;
    }

    /**
     * Get membership level (placeholder - implement based on business logic)
     */
    private function getMembershipLevel(User $member): string
    {
        return $member->membershipTier?->name ?? 'N/A';
    }

    /**
     * Get membership level label
     */
    private function getMembershipLevelLabel(User $member): string
    {
        return $member->membershipTier?->name ?? 'N/A';
    }

    /**
     * Get status label
     */
    private function getStatusLabel(?UserStatus $status): string
    {
        if (! $status) {
            return 'Unknown';
        }

        return match ($status) {
            UserStatus::ACTIVE => '활성',
            UserStatus::INACTIVE => '비활성',
            UserStatus::BLOCKED => '차단',
            default => 'Unknown',
        };
    }

    /**
     * Get search filters metadata
     * 검색 필터 메타데이터 조회
     */
    public function getSearchFilters(): array
    {
        return [
            'authority_options' => $this->getAuthorityOptions(),
            'approval_status_options' => $this->getApprovalStatusOptions(),
            'status_options' => $this->getStatusOptions(),
            'sort_options' => [
                ['value' => 'created_at', 'label' => '등록일'],
                ['value' => 'name', 'label' => '이름'],
                ['value' => 'status', 'label' => '상태'],
            ],
        ];
    }

    /**
     * Get authority options
     */
    private function getAuthorityOptions(): array
    {
        // Get distinct authority values from users
        $authorities = User::distinct()
            ->whereNotNull('authority')
            ->pluck('authority')
            ->map(function ($authority) {
                return [
                    'value' => $authority,
                    'label' => $this->getAuthorityLabel($authority),
                ];
            })
            ->values()
            ->toArray();

        return $authorities;
    }

    /**
     * Get authority label
     */
    private function getAuthorityLabel(string $authority): string
    {
        // Map authority values to Korean labels
        return match ($authority) {
            'master' => '마스터권한',
            'employee' => '사원권한',
            'team_approval' => '팀 결재권한',
            'business_office_approval' => '사업소 결재권한',
            'headquarters_approval' => '본부 결재권한',
            default => $authority,
        };
    }

    /**
     * Get approval status options
     */
    private function getApprovalStatusOptions(): array
    {
        return [
            ['value' => ApprovalStatus::PENDING->value, 'label' => ApprovalStatus::PENDING->label()],
            ['value' => ApprovalStatus::ACCEPTED->value, 'label' => ApprovalStatus::ACCEPTED->label()],
            ['value' => ApprovalStatus::REJECTED->value, 'label' => ApprovalStatus::REJECTED->label()],
        ];
    }

    /**
     * Get status options
     */
    private function getStatusOptions(): array
    {
        return [
            ['value' => UserStatus::ACTIVE->value, 'label' => '활성'],
            ['value' => UserStatus::INACTIVE->value, 'label' => '비활성'],
            ['value' => UserStatus::BLOCKED->value, 'label' => '차단'],
        ];
    }

    /**
     * Register a new member
     * 회원 등록
     */
    public function registerMember(array $data, ?User $adminUser = null): User
    {
        try {
            DB::beginTransaction();

            $memberData = [
                'name' => $data['name'],
                'username' => $data['username'],
                'password' => Hash::make($data['password']),
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'mobile' => $data['mobile'] ?? null,
                'member_type' => MemberType::from($data['member_type']),
                'postcode' => $data['postcode'] ?? null,
                'address' => $data['address'] ?? null,
                'detailed_address' => $data['detailed_address'] ?? null,
                'authority' => $data['authority'] ?? null,
                'status' => isset($data['status']) ? UserStatus::from($data['status']) : UserStatus::ACTIVE,
                'agree_privacy' => true, // Admin registration assumes agreement
                'agree_terms' => true,
                'agreed_at' => now(),
            ];

            if ($data['member_type'] == MemberType::BUSINESS->value) {
                // Business info
                $memberData = array_merge(
                    $memberData,
                    [
                        'company_name' => $data['company_name'] ?? null,
                        'business_registration_number' => $data['business_registration_number'] ?? null,
                        'representative_name' => $data['representative_name'] ?? null,
                        'business_type' => $data['business_type'] ?? null,
                        'industry_type' => $data['industry_type'] ?? null,
                        'business_postcode' => $data['business_postcode'] ?? null,
                        'business_address' => $data['business_address'] ?? null,
                        'business_address_detail' => $data['business_address_detail'] ?? null,
                        'tax_invoice_email' => $data['tax_invoice_email'] ?? null,
                        'homepage_url' => $data['homepage_url'] ?? null,
                        'business_registration_file' => $data['business_registration_file'] ?? null,
                    ]
                );
            }

            $member = User::create($memberData);

            DB::commit();

            return $member;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create Member failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Change member password
     *
     * @return User|null
     */
    public function changePassword(int|string $memberId, string $newPassword)
    {
        try {
            $member = $this->getMember($memberId);

            $member->update([
                'password' => Hash::make($newPassword),
            ]);

            return $member->fresh();
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
