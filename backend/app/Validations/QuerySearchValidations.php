<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Validações padronizadas para os campos de pesquisa
 */
class QuerySearchValidations {
    public static function validateQuerySearch(Request $request) {
        $rules = [
            'q' => 'nullable|string|max:255'
        ];

        return Validator::make($request->all(), $rules);
    }
        
}
