<?php

namespace App\Http\Requests\Admin\Banner;

use App\Enums\SiteType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Enum;

class AdminBannerStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'image_path' => ['required', 'string', 'max:500'],
            'image_path_mobile' => ['nullable', 'string', 'max:500'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'exposure_target' => ['nullable'], // all | array of customer IDs
            'site_type' => ['required', new Enum(SiteType::class)],
            'page_type' => ['nullable', 'string', 'max:80'],
            'exposure_location' => ['required', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:exposed,non-exposed'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'exposure_start_date' => ['nullable', 'date'],
            'exposure_end_date' => ['nullable', 'date', 'after_or_equal:exposure_start_date'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
