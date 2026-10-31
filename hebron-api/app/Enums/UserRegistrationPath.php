<?php

namespace App\Enums;

enum UserRegistrationPath: string
{
    case DIRECT = 'direct';
    case MOBILE_APP = 'mobile_app';
    case SOCIAL_LOGIN = 'social_login';
    case REFERRAL = 'referral';

    public function getLabel(): string
    {
        return match ($this) {
            self::DIRECT => '직접가입',
            self::MOBILE_APP => '모바일앱',
            self::SOCIAL_LOGIN => '소셜로그인',
            self::REFERRAL => '추천가입',
        };
    }
}
