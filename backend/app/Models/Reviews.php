<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reviews extends Model
{
    protected $table = 'reviews';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'documento_id',
        'user_id',
        'review',
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Documents::class, 'documento_id', 'id');
    }
}
