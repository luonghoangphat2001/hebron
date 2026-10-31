<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <style>
        @font-face { font-family: 'NanumGothic'; font-style: normal; font-weight: 400; src: url('{{ $fontPath }}') format('truetype'); }
        @font-face { font-family: 'NanumGothic'; font-style: normal; font-weight: 700; src: url('{{ $fontPathBold }}') format('truetype'); }
        @page { margin: 34px 40px; }
        * { box-sizing: border-box; }
        body { color: #222; font-family: 'NanumGothic', sans-serif; font-size: 12px; line-height: 1.55; margin: 0; }
        h1 { font-size: 24px; line-height: 1.3; margin: 0 0 6px; }
        .heading { border-bottom: 2px solid #222; margin-bottom: 22px; padding-bottom: 14px; }
        .subtitle { color: #777; font-size: 11px; }
        .sku { color: #555; margin-top: 4px; }
        .gallery { font-size: 0; margin: 0 -5px 20px; text-align: center; }
        .image-cell { display: inline-block; padding: 5px; vertical-align: middle; width: {{ count($images) > 1 ? '50%' : '100%' }}; }
        .image-box { border: 1px solid #e2e2e2; height: {{ count($images) > 1 ? '225px' : '360px' }}; padding: 8px; }
        .image-box img { height: 100%; max-width: 100%; object-fit: contain; }
        .empty-image { background: #f7f7f7; color: #999; font-size: 12px; margin-bottom: 20px; padding: 70px 10px; text-align: center; }
        h2 { font-size: 16px; margin: 0 0 10px; }
        table { border-collapse: collapse; table-layout: fixed; width: 100%; }
        th, td { border: 1px solid #d9d9d9; padding: 9px 11px; vertical-align: top; }
        th { background: #f3f3f3; font-weight: 700; text-align: left; width: 27%; }
        td { overflow-wrap: break-word; }
        .description { color: #555; margin: 0 0 18px; }
    </style>
</head>
<body>
    <div class="heading">
        <h1>{{ $product->name }}</h1>
        @if($product->name_en && $product->name_en !== $product->name)
            <div class="subtitle">{{ $product->name_en }}</div>
        @endif
        @if($product->sku)
            <div class="sku">제품 코드: {{ $product->sku }}</div>
        @endif
    </div>

    @if(count($images))
        <div class="gallery">
            @foreach($images as $image)
                <div class="image-cell"><div class="image-box"><img src="{{ $image }}" alt=""></div></div>
            @endforeach
        </div>
    @else
        <div class="empty-image">등록된 제품 이미지가 없습니다.</div>
    @endif

    @if($product->short_description)
        <p class="description">{{ strip_tags($product->short_description) }}</p>
    @endif

    @if(filled($product->description))
        @php
            $description = preg_replace('/<\s*(script|style)\b[^>]*>.*?<\s*\/\s*\1\s*>/is', '', (string) $product->description);
            $description = strip_tags($description, '<p><br><strong><b><em><i><ul><ol><li><h3><h4>');
            $description = preg_replace('/\s+on[a-z]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $description);
            $description = preg_replace('/\s+(?:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|\'\s*javascript:[^\']*\'|[^\s>]+)/i', '', $description);
        @endphp
        @if(filled(trim($description)))
            <section class="product-description">
                <h2>제품 설명</h2>
                <div class="description">{!! $description !!}</div>
            </section>
        @endif
    @endif

    <h2>제품 사양</h2>
    @php
        $spec = $product->specification;
        $rows = [
            '사이즈' => $spec?->size,
            '재질' => $spec?->materials,
            '규격' => $spec?->case,
            '제작 기간' => $spec?->product_period,
            '총 제작 수량' => $spec?->total_product_amount,
            '배송 안내' => $spec?->shipping_info,
            '무게' => $spec?->weight,
            '비고' => $spec?->notes,
        ];
    @endphp
    <table>
        @foreach($rows as $label => $value)
            @if(filled($value))
                <tr><th>{{ $label }}</th><td>{!! nl2br(e($value)) !!}</td></tr>
            @endif
        @endforeach
        @if(!collect($rows)->contains(fn ($value) => filled($value)))
            <tr><td colspan="2">등록된 제품 사양이 없습니다.</td></tr>
        @endif
    </table>
</body>
</html>
