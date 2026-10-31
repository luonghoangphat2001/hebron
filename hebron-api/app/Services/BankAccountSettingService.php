<?php

namespace App\Services;

use App\Models\BankAccountSetting;

class BankAccountSettingService
{
    public function get(): ?BankAccountSetting
    {
        return BankAccountSetting::query()->first();
    }

    public function upsert(array $data): BankAccountSetting
    {
        $setting = BankAccountSetting::query()->first() ?? new BankAccountSetting;
        $setting->fill($data);
        $setting->save();

        return $setting->fresh();
    }
}
