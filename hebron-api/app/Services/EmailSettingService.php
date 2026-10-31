<?php

namespace App\Services;

use App\Models\EmailSetting;

class EmailSettingService
{
    public function getSettings(): EmailSetting
    {
        return EmailSetting::getOrCreate();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateSettings(array $data): EmailSetting
    {
        $setting = EmailSetting::getOrCreate();

        $receiverEmails = is_array($data['receiver_emails'] ?? null)
            ? array_values(array_unique(array_filter(array_map('trim', $data['receiver_emails']))))
            : [];

        $setting->update([
            'sender_email' => trim($data['sender_email']),
            'sender_name' => isset($data['sender_name']) ? trim($data['sender_name']) : null,
            'receiver_emails' => $receiverEmails,
        ]);

        return $setting->fresh();
    }

    /**
     * @return array<int, string>
     */
    public function getReceiverEmails(): array
    {
        return $this->getSettings()->getEffectiveReceiverEmails();
    }

    /**
     * @return array{address: string, name: string}
     */
    public function getSender(): array
    {
        $setting = $this->getSettings();

        return [
            'address' => $setting->getEffectiveSenderEmail(),
            'name' => $setting->getEffectiveSenderName(),
        ];
    }
}
