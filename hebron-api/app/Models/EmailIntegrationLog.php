<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailIntegrationLog extends Model
{
    protected $fillable = [
        'order_number', 'sender', 'recipients', 'subject', 'status',
        'message_id', 'error_message', 'queued_at', 'sent_at', 'failed_at',
    ];

    protected $casts = [
        'recipients' => 'array',
        'queued_at' => 'datetime',
        'sent_at' => 'datetime',
        'failed_at' => 'datetime',
    ];
}
