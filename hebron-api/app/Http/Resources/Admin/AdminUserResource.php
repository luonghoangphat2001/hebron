<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Basic info
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,

            // Contact
            'phone' => $this->phone,
            'mobile' => $this->mobile,

            // Status & authority
            'status' => $this->status?->value,
            'authority' => $this->authority,

            // Address
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,

            // Agreements
            'agree_privacy' => $this->agree_privacy,
            'agree_terms' => $this->agree_terms,
            'agreed_at' => $this->agreed_at?->toISOString(),
            'email_verified_at' => $this->email_verified_at?->toISOString(),

            // Login info
            'last_login_at' => $this->last_login_at?->toISOString(),
            'last_login_ip' => $this->last_login_ip,

            // Admin Permissions
            'admin_permissions' => AdminUserPermissionResource::collection($this->whenLoaded('adminPermissions')),
            'admin_permissions_ids' => $this->whenLoaded(
                'adminPermissions',
                fn (): array => $this->adminPermissions->pluck('admin_permission_id')->values()->all(),
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
