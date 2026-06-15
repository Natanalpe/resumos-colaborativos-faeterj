<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Collections extends Model
{

    protected $table = 'colecoes';
    public $timestamps = true;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome',
        'user_id'
    ];

    public function summaries()
    {
        return $this->hasManyThrough(
            Summaries::class,
            CollectionDocument::class,
            'colecao_id',
            'id',
            'id',
            'documento_id'
        );
    }

    public function ColecaoDocumento() {
        return $this->hasMany(CollectionDocument::class, 'colecao_id', 'id');
    }
}
