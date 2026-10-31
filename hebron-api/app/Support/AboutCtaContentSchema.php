<?php

namespace App\Support;

class AboutCtaContentSchema
{
    /** @return array<string, mixed> */
    public static function validationRules(): array
    {
        return [
            'content' => [
                'sometimes',
                'nullable',
                'array:label,heading,description,button_label,button_variant,primary_button,item,secondary_button,third_button',
            ],
            'content.label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'content.heading' => ['sometimes', 'nullable', 'string', 'max:500'],
            'content.description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'content.button_label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'content.button_variant' => ['sometimes', 'nullable', 'string', 'max:50'],
            'content.primary_button' => ['sometimes', 'nullable', 'array:link,label,variant'],
            'content.primary_button.link' => ['sometimes', 'nullable', 'string', 'max:500'],
            'content.primary_button.label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'content.primary_button.variant' => ['sometimes', 'nullable', 'string', 'max:50'],
            'content.item' => ['sometimes', 'nullable', 'array', 'max:20'],
            'content.item.*' => ['required', 'array:product_id,image'],
            'content.item.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'content.item.*.image' => ['required', 'nullable', 'string', 'max:500'],
            'content.secondary_button' => ['sometimes', 'nullable', 'array:link,label,variant'],
            'content.secondary_button.link' => ['sometimes', 'nullable', 'string', 'max:500'],
            'content.secondary_button.label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'content.secondary_button.variant' => ['sometimes', 'nullable', 'string', 'max:50'],
            'content.third_button' => ['sometimes', 'nullable', 'array:link,label,variant'],
            'content.third_button.link' => ['sometimes', 'nullable', 'string', 'max:500'],
            'content.third_button.label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'content.third_button.variant' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }
}
