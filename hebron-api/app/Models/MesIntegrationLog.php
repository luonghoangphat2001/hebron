<?php

namespace App\Models;

use App\Enums\MesIntegrationDirection;
use App\Enums\MesIntegrationStatus;
use App\Enums\MesReferenceType;
use App\Enums\MesTriggerType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class MesIntegrationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'direction',
        'trigger_type',
        'reference_type',
        'reference_id',
        'http_method',
        'endpoint',
        'request_headers',
        'request_body',
        'response_status',
        'response_headers',
        'response_body',
        'status',
        'duration_ms',
        'error_message',
        'requested_at',
        'responded_at',
    ];

    protected $casts = [
        'direction'        => MesIntegrationDirection::class,
        'trigger_type'     => MesTriggerType::class,
        'reference_type'   => MesReferenceType::class,
        'status'           => MesIntegrationStatus::class,
        'request_headers'  => 'array',
        'request_body'     => 'array',
        'response_headers' => 'array',
        'response_body'    => 'array',
        'requested_at'     => 'datetime',
        'responded_at'     => 'datetime',
        'duration_ms'      => 'integer',
    ];
}