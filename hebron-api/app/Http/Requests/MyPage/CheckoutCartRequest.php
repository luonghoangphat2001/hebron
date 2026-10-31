<?php

namespace App\Http\Requests\MyPage;

use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class CheckoutCartRequest extends CheckoutCartQuoteRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $orderer = $this->input('orderer');
        if (is_array($orderer)) {
            $orderer = $this->mergePhoneAndEmail($orderer);
            $this->merge(['orderer' => $orderer]);
        }

        $shipping = $this->input('shipping');
        if (is_array($shipping)) {
            $shipping = $this->mergePhoneAndEmail($shipping);
            $this->merge(['shipping' => $shipping]);
        }
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<string, mixed>
     */
    private function mergePhoneAndEmail(array $block): array
    {
        $phone = $block['phone'] ?? null;
        $parts = $block['phone_parts'] ?? null;
        if (($phone === null || $phone === '') && is_array($parts) && $parts !== []) {
            $block['phone'] = preg_replace('/\D/', '', implode('', array_map('strval', $parts)));
        }

        $email = $block['email'] ?? null;
        $local = $block['email_local'] ?? null;
        $domain = $block['email_domain'] ?? null;
        if (($email === null || $email === '') && is_string($local) && $local !== '' && is_string($domain) && $domain !== '') {
            $block['email'] = $local.'@'.$domain;
        }

        return $block;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paymentMethodValues = array_map(fn ($case) => $case->value, PaymentMethod::cases());
        $shippingMethodValues = array_map(fn ($case) => $case->value, ShippingMethod::cases());

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

            'customer_note' => ['nullable', 'string'],
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            if ($this->boolean('shipping.same_as_orderer') && ! $this->has('orderer')) {
                $v->errors()->add('orderer', '주문자 정보와 동일을 선택한 경우 주문자(orderer) 정보가 필요합니다.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'payment_method.in' => '유효하지 않은 결제 방법입니다.',
            'orderer.name.required' => '주문자 이름을 입력해 주세요.',
            'orderer.phone.required' => '주문자 연락처를 입력해 주세요.',
            'customer_note.max' => '고객 메모는 :max자를 초과할 수 없습니다.',
            'requested_delivery_date.date' => '배송 요청일은 유효한 날짜여야 합니다.',
            'requested_delivery_date.after' => '배송 요청일은 오늘 이후여야 합니다.',
            'point_use.multiple_of' => '포인트는 100P 단위로만 사용할 수 있습니다.',
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

    /**
     * Shipping block with same_as_orderer applied (does not mutate request).
     *
     * @param  array<string, mixed>  $data  validated payload
     * @return array<string, mixed>
     */
    public static function resolvedShipping(array $data): array
    {
        $shipping = is_array(Arr::get($data, 'shipping')) ? $data['shipping'] : [];
        $orderer = is_array(Arr::get($data, 'orderer')) ? $data['orderer'] : [];

        if (! empty($shipping['same_as_orderer'])) {
            return array_merge($shipping, [
                'name' => $orderer['name'] ?? $shipping['name'] ?? null,
                'phone' => $orderer['phone'] ?? $shipping['phone'] ?? null,
                'postcode' => $orderer['postcode'] ?? $shipping['postcode'] ?? null,
                'address' => $orderer['address'] ?? $shipping['address'] ?? null,
                'address_detail' => $orderer['address_detail'] ?? $shipping['address_detail'] ?? null,
                'email' => $shipping['email'] ?? null,
            ]);
        }

        return $shipping;
    }
}
