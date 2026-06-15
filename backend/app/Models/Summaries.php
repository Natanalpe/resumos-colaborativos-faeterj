<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Summaries extends Model
{

    protected $table = 'documentos';
    protected $keyType = 'string';
    public $imcrementing = false;

    protected $fillable = [
        'titulo',
        'conteudo',
        'conteudo_texto',
        'tipo',
        'tag',
        'apagado',
        'materia_id',
        'user_id',
    ];

    protected $hidden = ['conteudo'];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }


    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }


    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subjects::class, 'materia_id');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Subjects::class, 'materia_id', 'id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Reviews::class, 'documento_id', 'id');
    }

    public function collectionDocuments(): HasMany
    {
        return $this->hasMany(CollectionDocument::class, 'documento_id', 'id');
    }

    public function collections()
    {
        return $this->belongsToMany(
            Collections::class,
            'colecao_documento',
            'documento_id',
            'colecao_id'
        )->withPivot('ordem', 'user_id')
            ->withTimestamps();
    }

    public function teachers()
    {
        return $this->hasManyThrough(
            User::class,
            'professor_materia',
            'materia_id',
            'id',
            'materia_id',
            'professor_id'
        )->where('role', 'professor');
    }
}
