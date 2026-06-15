<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Logs extends Model
{
    use HasUuid;
    
    public $incrementing = false;
    protected $table = 'logs';
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'acao',
        'acao_ocorreu_com_sucesso'
    ];
    protected $hidden = [
        'created_at',
        'updated_at'
    ];
}
