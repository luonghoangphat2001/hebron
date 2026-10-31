<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('about_ctas')
            ->where('site_type', 'BRAND_SITE')
            ->get(['id', 'content']) as $row) {
            $content = json_decode($row->content ?? '[]', true) ?: [];
            $content['item'] = $this->sampleItems();
            unset($content['product_images']);

            DB::table('about_ctas')->where('id', $row->id)->update([
                'content' => json_encode($content),
            ]);
        }
    }

    public function down(): void
    {
        // The previous product image URLs cannot be reconstructed from product IDs.
    }

    /** @return array<int, array{product_id: int, image: string}> */
    private function sampleItems(): array
    {
        return [
            ['product_id' => 1, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/O5q4WQrIx9brBH9rNhplnypV63niebmxyxZQoS5U.png'],
            ['product_id' => 2, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/0Fd6kLai0YoYUZORHTswHHM16RVpar7kFD8TriJt.jpg'],
            ['product_id' => 3, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/hOvsJHyL7uxDnfiIaisATragsoUBhu0eLF5iYxNY.png'],
            ['product_id' => 4, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/uqQXSIvTNc4K95cUa6mCwa0QfRcnn2c08L6oYH8x.png'],
            ['product_id' => 5, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/RN24Q3qfkT3Nk5CKBGif70y8KQX8WHeR6hF5MuJJ.jpg'],
            ['product_id' => 6, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/ohhFCoeGtX4wR1dUwF4xHckuehPkxoUocrbNQm4Q.jpg'],
            ['product_id' => 7, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/Ex4dYmNh4Pjwq2MvloKdnyWFenNaSQRLLhMZyQ75.jpg'],
            ['product_id' => 8, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/k2VFX1bjmaTg9g12LcjwG5HUydCF5GStxrmiH5N8.jpg'],
            ['product_id' => 9, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/UotIKxOyUmztLsl7XtwyMkSTWZhLgzB8NxY1sw2h.jpg'],
            ['product_id' => 10, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/JjQm1VgmzaHTwfnxPLJg4jGNLaNog6Ifl8ABfpMk.jpg'],
            ['product_id' => 11, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/dvd9jCzxy5MANDDpvh5Lg65Hv7Jvm0OPonw1Y6lf.jpg'],
            ['product_id' => 12, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/LyjnzezqycwOfeciKuCEOW8m9v1NLdjyPtR75OX1.jpg'],
            ['product_id' => 13, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/k5UR9yXSuvzZZ7fiIPtoJBcnLfWVD1zCnmEfRi9D.jpg'],
            ['product_id' => 14, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/OHL6NBtXmkfWkgGvjtnlrNEgNnXT5UJHIxCDC5pH.png'],
            ['product_id' => 15, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/Q4E7QiWG82n5M4vby75g4S9rSCj2gRdvyJRNs0lE.jpg'],
            ['product_id' => 16, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/kE1OWRNNGKhUmCbpysVsy1cHWO9LGRfpcO9KUMpy.jpg'],
            ['product_id' => 17, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/hXfusYujy24gAByk9GIHsTJZ5gezquYN97QTQ4oj.jpg'],
            ['product_id' => 18, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/SefWdfbBQH4A26N4yZgNC67N5HEOrMLs0BPogBMM.jpg'],
            ['product_id' => 19, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/Q77oHoHJFA15TQ7Y1lSzXHSx8wtU4w3poQdIMqAf.jpg'],
            ['product_id' => 20, 'image' => 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com/products/images/y560rAmdN9nImR9pUYTnry2GDwxZXBLZnsU4TNmv.png'],
        ];
    }
};
