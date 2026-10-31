<?php

namespace App\Services\Notifications;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AligoAlimTalkService
{
    private const SEND_ENDPOINT = '/akv10/alimtalk/send/';
    private const TEMPLATE_LIST_ENDPOINT = '/akv10/template/list/';
    private const HTTP_TIMEOUT_SECONDS = 15;
    private const MAX_RECEIVERS_PER_REQUEST = 500;
    private const TEST_MODE_PAYLOAD_KEY = 'testmode_yn';
    private const TEST_MODE_ENABLED_VALUE = 'Y';

    private string $apiKey;
    private string $userId;
    private string $senderKey;
    private string $sender;
    private string $baseUrl;
    private bool $testMode;

    public function __construct() {
        $this->apiKey = (string) config('services.aligo.api_key', '');
        $this->userId = (string) config('services.aligo.user_id', '');
        $this->senderKey = (string) config('services.aligo.sender_key', '');
        $this->sender = (string) config('services.aligo.sender_number', '');
        $this->baseUrl = (string) config('services.aligo.base_url', '');
        $this->testMode = (bool) config('services.aligo.test_mode', false);
    }

    /**
     * Send AlimTalk to one or multiple receivers.
     *
     * @param array<int, AligoAlimTalkMessage> $messages
     *
     * @throws ConnectionException
     * @throws RuntimeException
     */
    public function send(
        string $templateCode,
        array $messages,
        ?string $sendDate = null,
    ): array {
        if ($messages === []) {
            throw new RuntimeException(
                'AlimTalk messages cannot be empty.'
            );
        }

        if (count($messages) > self::MAX_RECEIVERS_PER_REQUEST) {
            throw new RuntimeException(
                sprintf('Aligo AlimTalk supports a maximum of %d receivers per request.', self::MAX_RECEIVERS_PER_REQUEST)
            );
        }

        $payload = [
            'tpl_code' => $templateCode,
            'sender' => $this->sender,
        ];

        if ($sendDate !== null) {
            $payload['senddate'] = $sendDate;
        }

        if ($this->testMode) {
            $payload[self::TEST_MODE_PAYLOAD_KEY] = self::TEST_MODE_ENABLED_VALUE;
        }

        foreach ($messages as $index => $message) {
            $number = $index + 1;

            $payload["receiver_{$number}"] = $message->receiver;

            if ($message->recvname !== null) {
                $payload["recvname_{$number}"] = $message->recvname;
            }

            if ($message->subject !== null) {
                $payload["subject_{$number}"] = $message->subject;
            }

            $payload["message_{$number}"] = $message->message;

            if ($message->buttons !== []) {
                $payload["button_{$number}"] = json_encode(
                    [
                        'button' => $message->buttons,
                    ],
                    JSON_UNESCAPED_UNICODE
                        | JSON_UNESCAPED_SLASHES
                        | JSON_THROW_ON_ERROR,
                );
            }
        }

        $data = $this->postJson(
            self::SEND_ENDPOINT,
            $payload,
        );
        return $data;
    }

    /**
     * Send AlimTalk to a single receiver.
     *
     * @throws ConnectionException
     * @throws RuntimeException
     */
    public function sendOne(
        string $templateCode,
        string $receiver,
        string $message,
        ?string $recvname = null,
        ?string $subject = null,
        array $buttons = [],
        ?string $sendDate = null,
    ): array {
        return $this->send(
            templateCode: $templateCode,
            messages: [
                new AligoAlimTalkMessage(
                    receiver: $receiver,
                    message: $message,
                    recvname: $recvname,
                    subject: $subject,
                    buttons: $buttons,
                ),
            ],
            sendDate: $sendDate,
        );
    }

    /**
     * Send immediately.
     *
     * @param array<int, AligoAlimTalkMessage> $messages
     *
     * @throws ConnectionException
     * @throws RuntimeException
     */
    public function sendNow(
        string $templateCode,
        array $messages,
    ): array {
        return $this->send(
            templateCode: $templateCode,
            messages: $messages,
        );
    }

    /**
     * Schedule sending.
     *
     * Aligo format: YmdHis
     * Example: 20260824100000
     *
     * @param array<int, AligoAlimTalkMessage> $messages
     *
     * @throws ConnectionException
     * @throws RuntimeException
     */
    public function sendAt(
        string $templateCode,
        array $messages,
        \DateTimeInterface $sendAt,
    ): array {
        return $this->send(
            templateCode: $templateCode,
            messages: $messages,
            sendDate: $sendAt->format('YmdHis'),
        );
    }

    /**
     * Get an AlimTalk template by template code.
     *
     * @return array<string, mixed>
     *
     * @throws ConnectionException
     * @throws RuntimeException
     */
    public function getTemplate(string $templateCode): array
    {
        $data = $this->postJson(
            self::TEMPLATE_LIST_ENDPOINT,
            [
                'tpl_code' => $templateCode,
            ],
        );

        $template = $data['list'][0] ?? null;

        if ($template === null) {
            throw new RuntimeException(
                "Aligo template not found: {$templateCode}"
            );
        }

        return $template;
    }

    /**
     * Create a Web Link button.
     *
     * WL = Web Link.
     */
    public function webLinkButton(
        string $name,
        string $pcUrl,
        ?string $mobileUrl = null,
    ): array {
        return [
            'name' => $name,
            'linkType' => 'WL',
            'linkPc' => $pcUrl,
            'linkMo' => $mobileUrl ?? $pcUrl,
        ];
    }

    /**
     * Create an App Link button.
     *
     * AL = App Link.
     */
    public function appLinkButton(
        string $name,
        string $androidUrl,
        ?string $iosUrl = null,
    ): array {
        return [
            'name' => $name,
            'linkType' => 'AL',
            'linkAnd' => $androidUrl,
            'linkIos' => $iosUrl ?? $androidUrl,
        ];
    }

    /**
     * Create a Delivery Tracking button.
     *
     * DS = Delivery Search.
     */
    public function deliveryButton(string $name): array
    {
        return [
            'name' => $name,
            'linkType' => 'DS',
        ];
    }

    /**
     * Create a Bot Keyword button.
     *
     * BK = Bot Keyword.
     */
    public function botKeywordButton(string $name): array
    {
        return [
            'name' => $name,
            'linkType' => 'BK',
        ];
    }

    /**
     * Create a Message Delivery button.
     *
     * MD = Message Delivery.
     */
    public function messageButton(string $name): array
    {
        return [
            'name' => $name,
            'linkType' => 'MD',
        ];
    }

    /**
     * Send POST request to Aligo.
     *
     * @throws ConnectionException
     */
    private function post(
        string $endpoint,
        array $payload,
    ): Response {
        return Http::asForm()
            ->acceptJson()
            ->timeout(self::HTTP_TIMEOUT_SECONDS)
            ->post(
                rtrim($this->baseUrl, '/') . $endpoint,
                [
                    'apikey' => $this->apiKey,
                    'userid' => $this->userId,
                    'senderkey' => $this->senderKey,
                    ...$payload,
                ],
            );
    }

    /**
     * Send POST request and validate Aligo response.
     *
     * @return array<string, mixed>
     *
     * @throws ConnectionException
     * @throws RuntimeException
     */
    private function postJson(
        string $endpoint,
        array $payload,
    ): array {

        $response = $this->post(
            endpoint: $endpoint,
            payload: $payload,
        );

        if ($response->failed()) {
            throw new RuntimeException(
                "Aligo API request failed: {$response->body()}"
            );
        }

        $data = $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'Invalid response from Aligo API.'
            );
        }

        if (($data['code'] ?? null) !== 0) {
            throw new RuntimeException(
                'Aligo API error: ' .
                    ($data['message'] ?? 'Unknown error')
            );
        }

        return $data;
    }
}
