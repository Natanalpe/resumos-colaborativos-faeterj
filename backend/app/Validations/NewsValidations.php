<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Validações padronizadas para o controller de notícias
 */
class NewsValidations
{
    public static function validateNews(Request $request)
    {
        $rules = [
            'titulo' => 'required|string|max:75|min:1',
            'conteudo' => 'required|string|max:2000|min:1',
        ];

        return Validator::make($request->all(), $rules);
    }

}
