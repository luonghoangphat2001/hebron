<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOutsourcingCompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'work_details'        => $this->work_details,
            'representative_name' => $this->representative_name,
            'email'               => $this->email,
            'contact'             => $this->contact,
            'address'             => $this->address,
            'memo'                => $this->memo,
            'is_active'           => $this->is_active,
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}
