<?php

namespace App\Mail;

use App\Models\EmailSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminTestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function envelope(): Envelope
    {
        $setting = EmailSetting::getOrCreate();

        return new Envelope(
            from: new Address(
                $setting->getEffectiveSenderEmail(),
                $setting->getEffectiveSenderName(),
            ),
            subject: '[Hebron] 이메일 발송 테스트',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<p>Hebron 이메일 설정 테스트 메일입니다. 정상적으로 발신 및 수신이 동작합니다.</p>',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
