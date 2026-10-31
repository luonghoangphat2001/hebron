<?php

namespace App\Http\Resources\Admin;

use App\Models\MesIntegrationLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMesIntegrationLogDetailResource extends JsonResource
{
    protected $data;

    public function __construct(MesIntegrationLog $data)
    {
        $this->data = $data;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->data->id,
            'direction' => $this->data->direction->value,
            'direction_label' => $this->data->direction->label(),
            'trigger_type' => $this->data->trigger_type->value,
            'trigger_type_label' => $this->data->trigger_type->label(),
            'reference_type' => $this->data->reference_type->value,
            'reference_type_label' => $this->data->reference_type->label(),
            'reference_id' => $this->data->reference_id,
            'http_method' => $this->data->http_method,
            'endpoint' => $this->data->endpoint,
            'request_headers' => $this->data->request_headers,
            'request_body' => $this->data->request_body,
            'response_status' => $this->data->response_status,
            'response_headers' => $this->data->response_headers,
            'response_body' => $this->data->response_body,
            'status' => $this->data->status->value,
            'status_label' => $this->data->status->label(),
            'duration_ms' => $this->data->duration_ms,
            'error_message' => $this->data->error_message,
            'requested_at' => $this->data->requested_at?->format('Y-m-d H:i:s'),
            'responded_at' => $this->data->responded_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->data->created_at,
            'updated_at' => $this->data->updated_at,
        ];
    }
}
