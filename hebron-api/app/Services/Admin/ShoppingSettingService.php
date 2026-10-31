<?php

namespace App\Services\Admin;

use App\Models\ShoppingSetting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class ShoppingSettingService
{
    public function getAllShoppingSettings(): Collection
    {
        return ShoppingSetting::all();
    }

    public function getShoppingSettingById(int $id): ?ShoppingSetting
    {
        return ShoppingSetting::find($id);
    }

    public function createShoppingSetting(array $data): ShoppingSetting
    {
        if (ShoppingSetting::where('type', $data['type'])->exists()) {
            throw new \Exception('A shopping setting with this type already exists.', 422);
        }

        try {
            return ShoppingSetting::create($data);
        } catch (QueryException $e) {
            if ($e->getCode() === 23000) {
                throw new \Exception('A shopping setting with this type already exists.', 422);
            }
            throw $e;
        }
    }

    public function updateShoppingSetting(int $id, array $data): ?ShoppingSetting
    {
        $setting = ShoppingSetting::find($id);
        if (! $setting) {
            return null;
        }

        if (isset($data['type']) && $data['type'] !== $setting->type->value) {
            if (ShoppingSetting::where('type', $data['type'])->where('id', '<>', $id)->exists()) {
                throw new \Exception('A shopping setting with this type already exists.', 422);
            }
        }

        try {
            $setting->update($data);
        } catch (QueryException $e) {
            if ($e->getCode() === 23000) {
                throw new \Exception('A shopping setting with this type already exists.', 422);
            }
            throw $e;
        }

        return $setting->fresh();
    }

    public function deleteShoppingSetting(int $id): bool
    {
        return ShoppingSetting::destroy($id) > 0;
    }
}