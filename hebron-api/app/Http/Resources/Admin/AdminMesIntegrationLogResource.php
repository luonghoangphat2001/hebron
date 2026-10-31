<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMesIntegrationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'direction' => $this->direction->value,
            'direction_label' => $this->direction->label(),
            'trigger_type' => $this->trigger_type->value,
            'trigger_type_label' => $this->trigger_type->label(),
            'reference_type' => $this->reference_type->value,
            'reference_type_label' => $this->reference_type->label(),
            'reference_id' => $this->reference_id,
            'http_method' => $this->http_method,
            'endpoint' => $this->endpoint,
            'request_headers' => $this->request_headers,
            'request_body' => $this->request_body,
            'response_status' => $this->response_status,
            'response_headers' => $this->response_headers,
            'response_body' => $this->response_body,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'duration_ms' => $this->duration_ms,
            'error_message' => $this->error_message,
            'requested_at' => $this->requested_at?->format('Y-m-d H:i:s'),
            'responded_at' => $this->responded_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}