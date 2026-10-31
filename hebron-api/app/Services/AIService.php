<?php

namespace App\Services;

use App\AI\Prompts\PlaquePrompt;
use Carbon\Carbon;
use OpenAI\Laravel\Facades\OpenAI;

class AIService
{
    public function generate(
        string $userPrompt,
        array $validated,
    ): array {
        $response = OpenAI::chat()->create([
            'model' => config('openai.model'),
            'messages' => [
                [
                    'role' => 'system',
                    'content' => PlaquePrompt::system(),
                ],
                [
                    'role' => 'user',
                    'content' => $userPrompt,
                ],
            ],
            'response_format' => [
                'type' => 'json_object',
            ],
        ]);

        $result = json_decode(
            $response->choices[0]->message->content,
            true,
            flags: JSON_THROW_ON_ERROR
        );

        foreach ($result['items'] as &$item) {
            $item['style'] = '정중한 스타일';
            $item['recipient'] = str_ends_with($validated['receiver'], '께')
                ? $validated['receiver']
                : "{$validated['receiver']}께";
            $item['date'] = Carbon::parse($validated['date'])->format('Y년 n월 j일');
            $item['sender'] = $validated['sender'];
        }

        return [
            'items' => $result['items'],
            'usage' => [
                'prompt_tokens' => $response->usage->promptTokens,
                'completion_tokens' => $response->usage->completionTokens,
                'total_tokens' => $response->usage->totalTokens,
            ],
        ];
    }
}
