<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Validações padronizadas para o controller de matérias
 */
class SubjectsValidations
{

    public static function validateSubjects(Request $request)
    {
        $rules = [
            'nome' => 'required|string|max:255|min:4',
            'sigla' => 'required|string|max:3|min:3',
            'professor_id' => [
                'nullable',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'professor');
                }),
            ]
        ];
        return Validator::make($request->all(), $rules);
    }
}
