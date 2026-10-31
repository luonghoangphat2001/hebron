<?php

namespace App\Http\Resources\Admin;

use App\Models\EmailSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EmailSetting
 */
class AdminEmailSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender_email' => $this->sender_email,
            'sender_name' => $this->sender_name,
            'receiver_emails' => $this->receiver_emails ?? [],
            'effective_sender_email' => $this->getEffectiveSenderEmail(),
            'effective_sender_name' => $this->getEffectiveSenderName(),
            'effective_receiver_emails' => $this->getEffectiveReceiverEmails(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
