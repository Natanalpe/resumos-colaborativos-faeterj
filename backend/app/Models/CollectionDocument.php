<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionDocument extends Model
{
    protected $table = 'colecao_documento';
    public $timestamps = true;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'documento_id',
        'colecao_id',
        'ordem'
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];
}
