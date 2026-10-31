<?php

namespace App\Services;

use App\Models\MesIntegrationLog;

class MesIntegrationLogService
{
    public function create(array $data): MesIntegrationLog
    {
        return MesIntegrationLog::create($data);
    }
}