<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subjects extends Model
{
    protected $table = 'materias';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome',
        'sigla',
    ];

    protected $hidden = [
        'updated_at',
        'created_at'
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    public function professores(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'professor_materia',
            'materia_id',
            'professor_id'
        )
            ->where('role', 'professor');
    }
}
