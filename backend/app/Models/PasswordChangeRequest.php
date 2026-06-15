<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordChangeRequest extends Model
{
    protected $table = 'requisicao_mudanca_senha';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'token',
        'hash_nova_senha',
        'confirmado',
        'created_at'
    ];

    protected $casts = [
        'confirmado' => 'boolean',
        'created_at' => 'datetime'
    ];
}
