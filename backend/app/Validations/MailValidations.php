<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Validações padronizadas para o controller de email
 */
class MailValidations
{
    public static function validateMail(Request $request)
    {
        $rules = [
            'email' => 'required|exists:users,email'
        ];

        $arrayRequest = $request->toArray();

        return Validator::make($arrayRequest, $rules);
    }
}
