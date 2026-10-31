<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InquiryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'category_label_en' => $this->category->labelEn(),
            'title' => $this->title,
            'content' => $this->content,
            'order_number' => $this->order_number,
            'contact' => $this->contact,
            'company_name' => $this->company_name,
            'manager_name' => $this->manager_name,
            'email' => $this->email,
            'deadline' => $this->deadline,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_label_en' => $this->status->labelEn(),
            'author_name' => $this->relationLoaded('user') && $this->user ? $this->user->name : null,
            'product_id' => $this->product_id,
            'product_type' => $this->product_type,
            'site_type' => $this->site_type,
            'quantity_type' => $this->quantity_type,
            'budget_type' => $this->budget_type,
            'product' => $this->relationLoaded('product') && $this->product ? [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'name_en' => $this->product->name_en,
                'sku' => $this->product->sku,
                'images' => $this->product->images,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include comments and attachments if loaded
        if ($this->relationLoaded('commentsNewestFirst')) {
            $data['comments'] = InquiryCommentResource::collection($this->commentsNewestFirst);
        } elseif ($this->relationLoaded('comments')) {
            $data['comments'] = InquiryCommentResource::collection($this->comments);
        }

        if ($this->relationLoaded('attachments')) {
            $data['attachments'] = InquiryAttachmentResource::collection($this->attachments
                ->where('is_reply_attachment', false)
                ->values());
        }

        return $data;
    }
}
