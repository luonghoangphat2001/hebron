<?php

namespace App\Http\Resources;

class PortfolioListResource extends PortfolioResource
{
    public function toArray($request): array
    {
        $data = parent::toArray($request);

        unset($data['gallery']);

        return $data;
    }
}
