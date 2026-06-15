<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class System extends Model {
    protected $table = 'sistema';
    protected $fillable = ['em_manutencao', 'previsao_fim'];
}