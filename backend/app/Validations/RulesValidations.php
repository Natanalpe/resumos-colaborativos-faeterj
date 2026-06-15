<?php

namespace App\Validations;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

/**
 * Validações padronizadas para o controller de regras
 */
class RulesValidations
{

    public static function validateCreateOrUpdateRules(Request $request)
    {
        $rules = [
            'rules' => 'required|string'
        ];

        $arrayRequest = $request->toArray();

        return Validator::make($arrayRequest, $rules);
    }
}
