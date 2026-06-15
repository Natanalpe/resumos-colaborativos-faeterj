<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    public function initializeHasUuid()
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }

    protected static function bootHasUuid()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }
}
