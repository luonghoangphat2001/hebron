<?php

namespace App\Enums;

enum SectionType: string
{
    case HERO_SECTION = 'hero_section';
    case CATEGORY_SHORTCUTS = 'category_shortcuts';
    case PRODUCT_PREVIEW = 'product_preview';
    case SECONDARY_BANNER = 'secondary_banner';
    case STEADY_SELLER = 'steady_seller';
    case FOOTER_QUICK_LINKS = 'footer_quick_links';
    case NOTICES_PREVIEW = 'notices_preview';
    case PORTFOLIO_PREVIEW = 'portfolio_preview';
    case CATEGORY_PRODUCT_SHOWCASE = 'category_product_showcase';
    case FAQ_SECTION = 'faq_section';
    case CUSTOMER_CENTER = 'customer_center';
    case CLIENT_LOGOS = 'client_logos';
    case BRAND_STATEMENT = 'brand_statement';
    case CUSTOM_PROCESS = 'custom_process';
    case PRESS_PREVIEW = 'press_preview';
    case MANUFACTURING_PROCESS = 'manufacturing_process';
    case CRAFTSMANSHIP_VALUES = 'craftsmanship_values';
    case ABOUT_CTA = 'about_cta';
    case BRAND_IDENTITY = 'brand_identity';
    case COMPANY_HISTORY = 'company_history';
    case CERTIFICATES = 'certificates';
    case PORTFOLIO_FEATURED = 'portfolio_featured';
    case PORTFOLIO_LIST = 'portfolio_list';
    case PROJECT_OVERVIEW = 'project_overview';
    case PROCESS_STEPS = 'process_steps';
    case PRODUCTION_VIDEO = 'production_video';
    case EQUIPMENT_GALLERY = 'equipment_gallery';
    case QUALITY_CONTROL = 'quality_control';
    case MEDIA_LIST = 'media_list';
    case PRODUCT_LIST = 'product_list';
    case CONTACT_INFORMATION = 'contact_information';
    case CONTACT_FORM = 'contact_form';
    case ACHIEVEMENT_CTA = 'achievement_cta';
    case INQUIRY_FORM = 'inquiry_form';
    case PRODUCT_CATALOG = 'product_catalog';
    case ORDER_LOOKUP = 'order_lookup';
    case RICH_TEXT = 'rich_text';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** @return array<int, string> */
    public static function valuesForManualUpdate(): array
    {
        $resolvedBySystem = [
            self::ABOUT_CTA,
            self::PRODUCT_CATALOG,
            self::PORTFOLIO_FEATURED,
            self::PORTFOLIO_LIST,
        ];

        return array_values(array_diff(
            self::values(),
            array_map(static fn (self $type) => $type->value, $resolvedBySystem)
        ));
    }

    public static function forPage(SiteType|string $siteType, PageType|string $pageType): array
    {
        $site = $siteType instanceof SiteType ? $siteType : SiteType::from($siteType);
        $page = $pageType instanceof PageType ? $pageType : PageType::from($pageType);

        return match ([$site, $page]) {
            [SiteType::SHOPPING_MALL, PageType::HOME_PAGE] => [
                self::HERO_SECTION, self::CATEGORY_SHORTCUTS, self::PRODUCT_PREVIEW,
                self::NOTICES_PREVIEW, self::SECONDARY_BANNER, self::STEADY_SELLER,
                self::FOOTER_QUICK_LINKS,
                self::CATEGORY_PRODUCT_SHOWCASE, self::FAQ_SECTION,
                self::CUSTOMER_CENTER, self::ABOUT_CTA,
            ],
            [SiteType::SHOPPING_MALL, PageType::ORDER_LOOKUP] => [self::HERO_SECTION, self::ORDER_LOOKUP],
            [SiteType::SHOPPING_MALL, PageType::TERMS],
            [SiteType::SHOPPING_MALL, PageType::PRIVACY] => [self::HERO_SECTION, self::RICH_TEXT],
            [SiteType::PLAIN_SITE, PageType::HOME_PAGE] => [self::HERO_SECTION, self::PRODUCT_CATALOG],
            [SiteType::BRAND_SITE, PageType::HOME_PAGE] => [
                self::HERO_SECTION, self::CLIENT_LOGOS, self::BRAND_STATEMENT,
                self::CRAFTSMANSHIP_VALUES, self::CUSTOM_PROCESS, self::PRESS_PREVIEW,
                self::MANUFACTURING_PROCESS,
                self::PORTFOLIO_PREVIEW, self::ABOUT_CTA,
            ],
            [SiteType::BRAND_SITE, PageType::BRAND_STORY] => [
                self::HERO_SECTION, self::CERTIFICATES, self::BRAND_IDENTITY, self::COMPANY_HISTORY,
            ],
            [SiteType::BRAND_SITE, PageType::PORTFOLIO] => [
                self::HERO_SECTION, self::PORTFOLIO_FEATURED, self::PORTFOLIO_LIST, self::ABOUT_CTA,
            ],
            [SiteType::BRAND_SITE, PageType::PORTFOLIO_DETAIL] => [self::HERO_SECTION, self::PROJECT_OVERVIEW],
            [SiteType::BRAND_SITE, PageType::PROCESS] => [
                self::HERO_SECTION, self::PROCESS_STEPS, self::ABOUT_CTA,
            ],
            [SiteType::BRAND_SITE, PageType::MEDIA] => [self::HERO_SECTION, self::MEDIA_LIST, self::ABOUT_CTA],
            [SiteType::BRAND_SITE, PageType::STANDARD_PRODUCTS] => [self::HERO_SECTION, self::PRODUCT_LIST, self::ABOUT_CTA],
            [SiteType::BRAND_SITE, PageType::FAQS] => [self::HERO_SECTION, self::ABOUT_CTA],
            [SiteType::BRAND_SITE, PageType::CONTACT_US] => [self::HERO_SECTION, self::CONTACT_INFORMATION, self::ABOUT_CTA],
            [SiteType::BRAND_SITE, PageType::PRODUCTION_INQUIRY] => [self::HERO_SECTION, self::INQUIRY_FORM, self::ABOUT_CTA],
            default => [],
        };
    }

    public static function valuesForPage(SiteType|string $siteType, PageType|string $pageType): array
    {
        return array_map(static fn (self $type) => $type->value, self::forPage($siteType, $pageType));
    }
}
