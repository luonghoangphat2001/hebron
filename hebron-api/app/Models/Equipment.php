<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use SoftDeletes;

    protected $table = 'equipments';

    protected $fillable = [
        'company_name',
        'name',
        'image',
        'work_process',
        'work_type',
        'status',
        'notes',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(EquipmentLog::class);
    }
}
