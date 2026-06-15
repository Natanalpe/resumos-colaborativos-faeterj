<?php

namespace App\Validations;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Validações padronizadas para o controller de usuários
 */
class UserValidations
{

    public static function validateCreateUser(Request $request)
    {
        $rules = [
            'nome' => 'required|string|max:255',
            'sobrenome' => 'required|string|max:255',
            'matricula' => 'required|string|max:255|unique:App\Models\User,matricula',
            'role' => 'required|in:professor,aluno,administrador'
        ];

        return Validator::make($request->all(), $rules);
    }

    public static function validateBulkCreateUser(User $user)
    {
        $rules = [
            'nome' => 'required|string|max:255',
            'sobrenome' => 'required|string|max:255',
            'matricula' => 'required|string|max:255|unique:App\Models\User,matricula',
            'role' => 'required|in:professor,aluno,administrador'
        ];

        $user = $user->toArray();

        return Validator::make($user, $rules);
    }

    public static function validateUpdateUser(Request $request, $id)
    {
        $rules = [
            'nome' => 'required|string|max:255',
            'sobrenome' => 'required|string|max:255',
            'matricula' => 'required|string|max:255|unique:App\Models\User,matricula,' . $id,
            'pode_postar' => 'required',
        ];

        return Validator::make($request->all(), $rules);
    }

    public static function validateDisableUser(Request $request)
    {
        $rules = [
            'razao_da_desativacao' => 'required|in:professor_saiu,aluno_abandonou_curso,aluno_concluiu_curso,aluno_trancou_curso,outro'
        ];

        return Validator::make($request->all(), $rules);
    }
}
