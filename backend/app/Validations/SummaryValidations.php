<?php

namespace App\Validations;

use App\Models\Documents;
use App\Models\Summaries;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Validações padronizadas para o controller de resumos
 */
class SummaryValidations
{
    public static function validateDocumentText(Summaries $document)
    {
        $rules = [
            'materia_id' => [
                'required',
                Rule::exists('materias', 'id')
            ],
            'user_id' => [
                'required',
                Rule::exists('users', 'id')
            ],
            'titulo' => 'required|string|max:255|min:3',
            'conteudo_texto' => 'required|string|min:10',
            'tipo' => 'required|in:imagem,txt,readme,youtube_link',
            'tag' => 'required|in:p1,p2,p3,pf,outros'
        ];

        $document = $document->toArray();

        return Validator::make($document, $rules);
    }

    // mime types disponíveis pra poder verificar: https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
    public static function validateDocumentImage(Summaries $document)
    {
        $rules = [
            'materia_id' => [
                'required',
                Rule::exists('materias', 'id')
            ],
            'user_id' => [
                'required',
                Rule::exists('users', 'id')
            ],
            'titulo' => 'required|string|max:255|min:3',
            'tipo' => 'required|in:imagem',
            'tag' => 'required|in:p1,p2,p3,pf,outros'
        ];

        return Validator::make($document->toArray(), $rules);
    }
}
