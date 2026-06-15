<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome',
        'email',
        'password',
        'primeiro_login',
        'sobrenome',
        'matricula',
        'ativo',
        'pode_postar',
        'razao_da_desativacao'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
