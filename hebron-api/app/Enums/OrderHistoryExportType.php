<?php

namespace App\Enums;

enum OrderHistoryExportType: string
{
    case ALL = 'ALL';
    case CURRENT_PAGE = 'CURRENT_PAGE';
}
