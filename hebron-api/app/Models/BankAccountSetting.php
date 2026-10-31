<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccountSetting extends Model
{
    protected $fillable = ['bank_name', 'account_number', 'account_holder', 'qr_url'];
}
