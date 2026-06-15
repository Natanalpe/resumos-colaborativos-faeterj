<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Warnings extends Model{

    use HasUuid;

    protected $table = 'advertencias';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'documento_id',
        'acao',
        'foi_visto',
        'descricao'
    ];

    public function student() {
        return $this->hasOne(User::class, 'id', 'user_id');
    }
}
