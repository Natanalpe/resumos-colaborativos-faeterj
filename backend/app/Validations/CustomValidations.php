<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomValidations
{

    public static function validateAdvertencias(Request $request): array
    {
        return $request->validate([
            'user_id' => 'required|exists:App\Models\User,id',
            'documento_id' => 'required|exists:App\Models\Documento,id',
            'acao' => 'required|in:multiplas_tentativas_de_upload,upload_de_virus,upload_de_conteudo_sensivel'
        ]);
    }

    public static function validateLogs(Request $request): array
    {
        return $request->validate([
            'user_id' => 'required|exists:App\Models\User,id',
            'acao' => 'required|in:login,logout,upload_documento,delecao_documento,review,registro_de_usuario,desativacao_de_usuario,mudanca_de_senha',
            'acao_ocorreu_com_sucesso' => 'required|boolean'
        ]);
    }

    public static function validateReview(Request $request)
    {
        $rules = [
            'documento_id' => 'required|exists:App\Models\Document,id',
            'user_id' => 'required|exists:App\Models\User,id',
            'review' => 'required|in:perfeito,util,confuso'
        ];

        return Validator::make($request->all(), $rules);
    }
}
