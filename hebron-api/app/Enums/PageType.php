<?php

namespace App\Enums;

enum PageType: string
{
    case HOME_PAGE = 'home_page';
    case BRAND_STORY = 'brand_story';
    case PORTFOLIO = 'portfolio';
    case PORTFOLIO_DETAIL = 'portfolio_detail';
    case PROCESS = 'process';
    case MEDIA = 'media';
    case STANDARD_PRODUCTS = 'standard_products';
    case FAQS = 'faqs';
    case CONTACT_US = 'contact_us';
    case PRODUCTION_INQUIRY = 'production_inquiry';
    case ORDER_LOOKUP = 'order_lookup';
    case TERMS = 'terms';
    case PRIVACY = 'privacy';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function valuesForSite(SiteType|string $siteType): array
    {
        $site = $siteType instanceof SiteType ? $siteType : SiteType::tryFrom($siteType);

        if ($site === null) {
            return self::values();
        }

        return match ($site) {
            SiteType::SHOPPING_MALL => [
                self::HOME_PAGE->value,
                self::ORDER_LOOKUP->value,
                self::TERMS->value,
                self::PRIVACY->value,
            ],
            SiteType::PLAIN_SITE => [self::HOME_PAGE->value],
            SiteType::BRAND_SITE => [
                self::HOME_PAGE->value,
                self::BRAND_STORY->value,
                self::PORTFOLIO->value,
                self::PORTFOLIO_DETAIL->value,
                self::PROCESS->value,
                self::MEDIA->value,
                self::STANDARD_PRODUCTS->value,
                self::FAQS->value,
                self::CONTACT_US->value,
                self::PRODUCTION_INQUIRY->value,
            ],
        };
    }
}
