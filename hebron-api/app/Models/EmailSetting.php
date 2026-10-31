<?php

namespace App\Models;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_email',
        'sender_name',
        'receiver_emails',
    ];

    protected $casts = [
        'receiver_emails' => 'array',
    ];

    public static function getOrCreate(): self
    {
        $setting = self::first();

        if (! $setting) {
            $setting = self::create([
                'sender_email' => config('mail.from.address'),
                'sender_name' => config('mail.from.name'),
                'receiver_emails' => config('mail.admin_notification_emails', []),
            ]);
        }

        return $setting;
    }

    public function getEffectiveSenderEmail(): string
    {
        return ! empty($this->sender_email)
            ? $this->sender_email
            : (string) config('mail.from.address', 'hello@example.com');
    }

    public function getEffectiveSenderName(): string
    {
        return ! empty($this->sender_name)
            ? $this->sender_name
            : (string) config('mail.from.name', 'Hebron');
    }

    /**
     * @return array<int, string>
     */
    public function getEffectiveReceiverEmails(): array
    {
        if (! empty($this->receiver_emails) && is_array($this->receiver_emails)) {
            $filtered = array_values(array_filter(array_map('trim', $this->receiver_emails)));
            if (! empty($filtered)) {
                return $filtered;
            }
        }

        $envReceivers = config('mail.admin_notification_emails', []);
        if (! empty($envReceivers) && is_array($envReceivers)) {
            $filtered = array_values(array_filter(array_map('trim', $envReceivers)));
            if (! empty($filtered)) {
                return $filtered;
            }
        }

        return User::query()
            ->where('authority', UserAuthority::SUPER_ADMIN->value)
            ->where('status', UserStatus::ACTIVE->value)
            ->whereNotNull('email')
            ->pluck('email')
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
