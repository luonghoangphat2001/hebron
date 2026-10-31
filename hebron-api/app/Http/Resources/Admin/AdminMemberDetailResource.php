<?php

namespace App\Http\Resources\Admin;

use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdminMemberDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'member_type' => $this->member_type?->value,
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,

            // Status Information
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->getStatusLabel(),
            ],
            'authority' => [
                'value' => $this->authority,
                'label' => $this->getAuthorityLabel(),
            ],

            'company_name' => $this->company_name,
            'business_registration_number' => $this->business_registration_number,
            'representative_name' => $this->representative_name,
            'business_type' => $this->business_type,
            'industry_type' => $this->industry_type,
            'business_postcode' => $this->business_postcode,
            'business_address' => $this->business_address,
            'business_address_detail' => $this->business_address_detail,
            'tax_invoice_email' => $this->tax_invoice_email,
            'homepage_url' => $this->homepage_url,
            'business_registration_file' => $this->getBusinessRegistrationFileUrl(),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get status label
     */
    private function getStatusLabel(): string
    {
        return match ($this->status) {
            UserStatus::ACTIVE => '활성',
            UserStatus::INACTIVE => '비활성',
            UserStatus::BLOCKED => '차단',
            default => 'Unknown',
        };
    }

    /**
     * Get authority label
     */
    private function getAuthorityLabel(): string
    {
        return match ($this->authority) {
            'master' => '마스터권한',
            'employee' => '사원권한',
            'team_approval' => '팀 결재권한',
            'business_office_approval' => '사업소 결재권한',
            'headquarters_approval' => '본부 결재권한',
            default => $this->authority ?? 'N/A',
        };
    }

    /**
     * Get full address
     */
    private function getFullAddress(): ?string
    {
        if (!$this->postcode && !$this->address && !$this->detailed_address) {
            return null;
        }

        $parts = array_filter([
            $this->postcode,
            $this->address,
            $this->detailed_address,
        ]);

        return !empty($parts) ? implode(' ', $parts) : null;
    }

    /**
     * Get the full URL for the business registration file.
     */
    private function getBusinessRegistrationFileUrl(): ?string
    {
        $path = $this->business_registration_file;

        if (!$path) {
            return null;
        }

        // Keep existing absolute URLs unchanged.
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return Storage::disk(config('filesystems.public_disk'))->url($path);
    }
}
