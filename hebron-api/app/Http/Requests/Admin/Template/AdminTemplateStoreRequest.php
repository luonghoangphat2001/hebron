<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTemplateStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'background_id' => [
                'nullable',
                'integer',
                Rule::exists('backgrounds', 'id')->whereNull('deleted_at'),
            ],
            'background_image_path' => 'nullable|string|max:500',
            'layout_config' => 'required|array',
            'layout_config.version' => 'required|integer',
            'layout_config.side' => 'required|string|in:single,double',
            'layout_config.page' => 'required|array',
            'layout_config.page.width' => 'required|numeric',
            'layout_config.page.height' => 'required|numeric',
            'layout_config.page.unit' => 'required|string|in:mm,px',
            'layout_config.guides' => 'nullable|array',
            'layout_config.guides.safe_margin' => 'nullable|numeric|min:0',
            'layout_config.guides.cut_offset_x' => 'nullable|numeric|min:0',
            'layout_config.guides.cut_offset_y' => 'nullable|numeric|min:0',
            'layout_config.guides.cut_frame_width' => 'nullable|numeric|min:1',
            'layout_config.guides.cut_frame_height' => 'nullable|numeric|min:1',
            'layout_config.guides.cut_offset_unit' => 'nullable|string|in:px',
            'layout_config.guides.layer_coordinate_space' => 'nullable|string|in:cutline,background',
            'layout_config.guides.unit' => 'nullable|string|in:mm,px',
            'layout_config.guides.front' => 'nullable|array',
            'layout_config.guides.front.cut_width' => 'nullable|numeric|min:1',
            'layout_config.guides.front.cut_height' => 'nullable|numeric|min:1',
            'layout_config.guides.front.safe_margin' => 'nullable|numeric|min:0',
            'layout_config.guides.front.cut_offset_x' => 'nullable|numeric|min:0',
            'layout_config.guides.front.cut_offset_y' => 'nullable|numeric|min:0',
            'layout_config.guides.front.cut_frame_width' => 'nullable|numeric|min:1',
            'layout_config.guides.front.cut_frame_height' => 'nullable|numeric|min:1',
            'layout_config.guides.front.cut_offset_unit' => 'nullable|string|in:px',
            'layout_config.guides.front.layer_coordinate_space' => 'nullable|string|in:cutline,background',
            'layout_config.guides.front.unit' => 'nullable|string|in:mm,px',
            'layout_config.guides.back' => 'nullable|array',
            'layout_config.guides.back.cut_width' => 'nullable|numeric|min:1',
            'layout_config.guides.back.cut_height' => 'nullable|numeric|min:1',
            'layout_config.guides.back.safe_margin' => 'nullable|numeric|min:0',
            'layout_config.guides.back.cut_offset_x' => 'nullable|numeric|min:0',
            'layout_config.guides.back.cut_offset_y' => 'nullable|numeric|min:0',
            'layout_config.guides.back.cut_frame_width' => 'nullable|numeric|min:1',
            'layout_config.guides.back.cut_frame_height' => 'nullable|numeric|min:1',
            'layout_config.guides.back.cut_offset_unit' => 'nullable|string|in:px',
            'layout_config.guides.back.layer_coordinate_space' => 'nullable|string|in:cutline,background',
            'layout_config.guides.back.unit' => 'nullable|string|in:mm,px',
            'layout_config.background' => 'nullable|array',
            'layout_config.layers' => 'present|array',
            'specifications' => 'nullable|array',
            'font_set' => 'nullable|array',
            'color_set' => 'nullable|array',
            'spot_color' => 'nullable|array',
            'editor_permission' => 'nullable|array',
            'preview_images' => 'nullable|array',
            'preview_images.*' => 'string|max:500',
            'is_active' => 'nullable|boolean',
        ];
    }
}
