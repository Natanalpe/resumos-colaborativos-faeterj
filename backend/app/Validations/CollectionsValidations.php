<?php

namespace App\Validations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Validações padronizadas para o controller de coleções
 */
class CollectionsValidations
{

    public static function validateCreateCollection(Request $request)
    {
        $rules = [
            'nome' => 'required|string|max:255|min:3'
        ];

        return Validator::make($request->all(), $rules);
    }

    public static function validateNameSearch(Request $request)
    {
        $rules = [
            'name' => 'nullable|string|max:255'
        ];

        return Validator::make($request->all(), $rules);
    }

    public static function validateremoveDocumentFromCollection(Request $request)
    {
        $rules = [
            'documento_id' => 'required|exists:App\Models\Summaries,id',
            'colecao_id' => 'required|exists:App\Models\Collections,id'
        ];

        return Validator::make($request->all(), $rules);
    }

    public static function validadeAddDocumentToCollection(Request $request)
    {
        $rules = [
            'documento_id' => 'required|exists:App\Models\Summaries,id',
        ];

        return Validator::make($request->all(), $rules);
    }

    public static function validateEditCollectionName(Request $request) {
        $rules = [
            'nome' => 'required|min:3|max:255',
        ];

        return Validator::make($request->all(), $rules);
    }

}
