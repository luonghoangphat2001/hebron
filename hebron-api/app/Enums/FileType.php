<?php

namespace App\Enums;

enum FileType: string
{
    case BUSINESS_REGISTRATIONS = 'business-registrations';
    case CUSTOMER_BUSINESS_REGISTRATION = 'customers/business-registration';
    case BANNERS = 'banners';
    case BACKGROUNDS = 'backgrounds';
    case CALLIGRAPHIES = 'calligraphies';
    case CATEGORY_EXPOSURE = 'categories/exposure';
    case GUIDE_CONTENT_ATTACHMENTS = 'guide-contents-attachments';
    case NOTICE_ATTACHMENTS = 'notices-attachments';
    case POPUPS = 'popups';
    case PRODUCT_IMAGES = 'products/images';
    case PRODUCT_AI = 'product/ai';
    case TEMPLATE_PREVIEWS = 'templates/previews';
    case TEMPLATES = 'templates';
    case BULK_ORDERS = 'bulk-orders';
    case INQUIRY_ATTACHMENTS = 'inquiry-attachments';
    case USER_GUIDES = 'user-guides';
    case DIRECT_SHIPPING = 'direct-shipping';
    case EQUIPMENTS = 'equipments';
    case PAPER = 'papers';
    case PORTFOLIO = 'portfolio';
    case PAGE_IMAGES = 'pages/images';
    case PAGE_VIDEO = 'page/video';
    case MEDIA = 'media';
    case ORDER_DESIGN_CONTENTS = 'order-design-contents';
    case DESIGN_REVISIONS = 'design-revisions';
    case DESIGN_GROUP = 'design-group';

    public function label(): string
    {
        return match ($this) {
            self::BUSINESS_REGISTRATIONS => 'Business Registrations',
            self::CUSTOMER_BUSINESS_REGISTRATION => 'Customer Business Registration',
            self::BANNERS => 'Banners',
            self::BACKGROUNDS => 'Backgrounds',
            self::CALLIGRAPHIES => 'Calligraphies',
            self::CATEGORY_EXPOSURE => 'Category Exposure',
            self::GUIDE_CONTENT_ATTACHMENTS => 'Guide Contents Attachments',
            self::NOTICE_ATTACHMENTS => 'Notice Attachments',
            self::POPUPS => 'Popups',
            self::PRODUCT_IMAGES => 'Product Images',
            self::PRODUCT_AI => 'Product AI',
            self::TEMPLATE_PREVIEWS => 'Template Previews',
            self::TEMPLATES => 'Templates',
            self::BULK_ORDERS => 'Bulk Orders',
            self::INQUIRY_ATTACHMENTS => 'Inquiry Attachments',
            self::USER_GUIDES => 'User Guides',
            self::DIRECT_SHIPPING => 'Direct Shipping',
            self::EQUIPMENTS => 'Equipments',
            self::PAPER => 'papers',
            self::PORTFOLIO => 'Portfolio',
            self::PAGE_IMAGES => 'Page Images',
            self::PAGE_VIDEO => 'Page Video',
            self::MEDIA => 'Media',
            self::ORDER_DESIGN_CONTENTS => 'Order Design Contents',
            self::DESIGN_REVISIONS => 'Design Revisions',
            self::DESIGN_GROUP => 'Design Group',
        };
    }

    public static function options(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
