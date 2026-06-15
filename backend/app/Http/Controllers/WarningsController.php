<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\User;
use App\Models\Warnings;
use App\Validations\WarningsValidations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Controller responsável pelo crud de advertência dos usuários.
 * Um administrador pode criar uma advertência para os usuários (alunos) no dashboard do administrador
 */
class WarningsController extends Controller
{

    // Pega a advertência de um usuário
    public function getByIds(Request $request, $user_id, $warnings_id)
    {
        try {
            // Para prevenir que outros usuáros vejam as asdvertências de outros.
            $user_logged = User::where('id', Auth::user()->id)->first();

            // Se o usuário logado não for um administrador ou o 'dono' da advertência, nega a requisição
            if ($user_logged->role != 'administrador' || Auth::user()->id != $user_id) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_AUTHORIZED,
                    401
                );
            }

            // Busca a advertência
            $warning = Warnings::where('id', $warnings_id)->where('user_id', $user_id)->first();

            // Se não houver advertencia, retorna um código 404 e a mensagem de not found
            if (!$warning) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Retorna a advertência, um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $warning,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    // Pega todas as advertencias de um usuário.
    public function getAllByUserId(Request $request, $user_id)
    {
        try {
            // Para prevenir que outros usuáros vejam as asdvertências de outros.  
            $user_logged = User::where('id', Auth::user()->id)->first();

            // Impede que um usuário visualize as advertencia de outros
            if ($user_logged->role != 'administrador' && Auth::user()->id != $user_id) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_AUTHORIZED,
                    401
                );
            }

            $warnings = [];

            // Aplica ou não a paginação
            if ($request->has('page')) {
                $warnings = Warnings::where('user_id', $user_id)->with('student:id,nome,sobrenome,matricula')->paginate(5, '*', 'page', $request->input('page'));
            } else {
                $warnings = Warnings::where('user_id', $user_id)->with('student:id,nome,sobrenome,matricula')->get();
            }

            // Se não houver advertencia, retorna um código 404 e a mensagem de not found
            if (!$warnings) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Retorna as advertencias, um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $warnings,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    // Cria uma advertencia para um usuário
    public function create(Request $request)
    {
        try {
            // Valida os dados vindos no corpo da requisição
            $validator = WarningsValidations::validateWarning($request);

            // Se houver falha nas validações retorna um código 422, os erros de validações e a mensagem de validation erros
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Cria a advertência
            DB::beginTransaction();
            $warnings = new Warnings($validator->validated());
            $warnings->save();
            DB::commit();

            // Retorna advertencias, um código 201 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $warnings,
                DefaultMessages::OK,
                201
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    // Apaga uma advertência
    public function delete(Request $request, $id)
    {
        try {
            // Apaga a advertencia
            $delete = Warnings::where('id', $id)->delete();

            // Se foi deletado, retorna um código 204 e a mensagem de Deletado
            if ($delete) {
                return DefaultResponse::HTTPResponse([], DefaultMessages::DELETED, 204);
            }

            // Se não foi deletado, retorna um 404 com a mensagem  de not found
            return DefaultResponse::HTTPResponse([], DefaultMessages::NOT_FOUND, 404);
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
            );
        }
    }

    /**
     * Pega a quantidade de advertências de um usuário.
     * 
     * Utilizado para mostrar, no perfil do usuário uma notificação com a quantidade de advertências.
     */
    public function getUserWarningQuantity(Request $request, $user_id)
    {
        try {
            // Para prevenir que outros usuáros acessem as asdvertências de outros.  
            $user_logged = User::where('id', Auth::user()->id)->first();

            // Impede que um usuário visualize as advertencia de outros
            if ($user_logged->role != 'administrador' && Auth::user()->id != $user_id) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_AUTHORIZED,
                    401
                );
            }

            $warnings = [];
            // Pega 
            $warnings = Warnings::where('user_id', $user_id)->count();

            // Se não houver advertencia, retorna um código 404 e a mensagem de not found
            if (!$warnings) {
                return DefaultResponse::HTTPResponse(
                    0,
                    DefaultMessages::NOT_FOUND,
                    200
                );
            }

            // Retorna as advertencias, um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $warnings,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }
}
