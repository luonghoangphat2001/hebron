<?php

namespace App\AI\Prompts;

class PlaquePrompt
{
    public static function system(): string
    {
        return <<<PROMPT
                You are a professional Korean plaque writer.

                Write natural and formal Korean.

                Do not invent facts.

                Return ONLY valid JSON in this format:

                {
                "items": [
                    {
                    "title": "string",
                    "message": "string"
                    }
                ]
                }

                Generate exactly 3 different items.
        PROMPT;
    }

    public static function buildPrompt(
        string $situation,
        string $receiver,
        string $message
    ): string {
        return <<<PROMPT
            Situation: {$situation}

            Recipient: {$receiver}

            Message:
            {$message}

            Choose one title for each item:
            - 감사패
            - 공로패
            - 기념패
            - 축하패

            Each message should:
            - Be 3–5 sentences.
            - Use different wording from the other items.
            PROMPT;
    }
}
