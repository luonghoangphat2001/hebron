<?php

namespace App\Http\Controllers\Api;

use App\AI\Prompts\PlaquePrompt;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends BaseController
{
    public function __construct(
        protected AIService $aiService
    ) {}

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'situation' => 'required|string',
            'receiver' => 'required|string',
            'message' => 'required|string',
            'date' => 'required|string',
            'sender' => 'required|string',
        ]);

        $prompt = PlaquePrompt::buildPrompt(
            $validated['situation'],
            $validated['receiver'],
            $validated['message'],
        );

        try {
            $result = $this->aiService->generate($prompt, $validated);

            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'AI 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
