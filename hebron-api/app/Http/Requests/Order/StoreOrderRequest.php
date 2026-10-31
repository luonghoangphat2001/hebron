<?php

namespace App\Http\Requests\Order;

use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use App\Models\Product;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends CalculateOrderQuoteRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $paymentMethodValues = array_map(fn ($case) => $case->value, PaymentMethod::cases());
        $shippingMethodValues = array_map(fn ($case) => $case->value, ShippingMethod::cases());

        // Direct checkout defaults to courier when the client follows the
        // compact guest-checkout payload and omits shipping_method.
        $shippingMethod = $this->input('shipping_method', ShippingMethod::COURIER->value);
        $requiresShippingAddress = in_array($shippingMethod, ['courier', 'quick'], true);

        return array_merge(parent::rules(), [
            'payment_method' => ['sometimes', 'string', 'in:'.implode(',', $paymentMethodValues)],

            // Contact (주문자 정보): name, 주소, 전화번호, 휴대폰, 이메일
            'contact.name' => ['required', 'string', 'max:255'],
            'contact.phone' => ['required', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'contact.phone2' => ['nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'contact.email' => ['required', 'email', 'max:255'],
            'contact.company_name' => ['nullable', 'string', 'max:255'],

            // Deprecated top-level key, retained for existing clients.
            'company_name' => ['nullable', 'string', 'max:255'],
            'contact.postcode' => ['nullable', 'string', 'max:20'],
            'contact.address' => ['nullable', 'string', 'max:255'],
            'contact.address_detail' => ['nullable', 'string', 'max:255'],

            // Shipping (배송 정보): name, 주소, 전화번호, 휴대폰, 이메일, 배송 메모
            'shipping.name' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:255'],
            'shipping.phone' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'shipping.postcode' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:20'],
            'shipping.address' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:255'],
            'shipping.address_detail' => ['nullable', 'string', 'max:255'],
            'shipping.customer_note' => ['nullable', 'string'],
            'shipping_method' => ['sometimes', 'string', 'in:'.implode(',', $shippingMethodValues)],

            // Deprecated top-level key, retained for existing clients.
            'customer_note' => ['nullable', 'string'],

            'design_group_id' => ['nullable', 'integer', 'exists:design_groups,id'],
            'order_design_content_id' => ['nullable', 'integer', 'exists:order_design_contents,id'],
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->filled('design_group_id') && $this->filled('order_design_content_id')) {
                $message = 'design_group_id 또는 order_design_content_id 중 정확히 하나만 입력해야 합니다.';
                $validator->errors()->add('design_group_id', $message);
                $validator->errors()->add('order_design_content_id', $message);
            }

            $productId = $this->input('product_id');
            $quantity = (int) $this->input('quantity', 1);
            if ($productId) {
                $product = Product::find($productId);
                if ($product && ! $product->hasSufficientStock($quantity)) {
                    $validator->errors()->add('quantity', '해당 상품의 재고가 부족합니다.');
                }
            }
        });
    }
}
