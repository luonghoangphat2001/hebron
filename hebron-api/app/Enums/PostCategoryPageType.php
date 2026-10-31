<?php

namespace App\Enums;

enum PostCategoryPageType: string
{
    case NOTICE = 'notice';
    case FAQ = 'faq';
    case PORTFOLIO = 'portfolio';
    case MEDIA = 'media';
    case EXAMPLE_SENTENCE_SAMPLE = 'example_sentence_sample';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function relationName(): string
    {
        return match ($this) {
            self::NOTICE => 'notices',
            self::FAQ => 'faqs',
            self::PORTFOLIO => 'portfolios',
            self::MEDIA => 'media',
            self::EXAMPLE_SENTENCE_SAMPLE => 'exampleSentenceSamples',
        };
    }
}
