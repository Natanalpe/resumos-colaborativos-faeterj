<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
/**
 * Validações padronizadas de autorização
 */
class QuerySearchValidations
{

    public static function validatePasswordChange(Request $request)
    {
        $rules = [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed|different:current_password',
        ];

        $arrayRequest = $request->toArray();

        return Validator::make($arrayRequest, $rules);
    }
}
