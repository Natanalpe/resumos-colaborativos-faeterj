<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Validações padronizadas para o controller de advertências
 */
class WarningsValidations
{

    public static function validateWarning(Request $request)
    {
        $rules = [
            'user_id' => [
                'required',
                Rule::exists('users', 'id')
            ],
            'documento_id' => [
                'nullable',
                Rule::exists('documentos', 'id')
            ],
            'acao' => "required|in:multiplas_tentativas_de_upload,upload_de_virus,upload_de_conteudo_sensivel,outros",
            'descricao' => "nullable|max:255"
        ];

        return Validator::make($request->all(), $rules);
    }
}
