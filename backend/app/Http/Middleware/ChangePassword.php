<?php

namespace App\Http\Middleware;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Middleware responsável por interceptar as requisições
 * e caso o usuário não tenha mudado a sua primeira senha ou 
 * registrado um email, é
 * retornado para o frontend uma mensagem indicando que será preciso
 * alterar a senha/cadastrar um email.
 */
class ChangePassword
{
    public function handle(Request $request, Closure $next)
    {
        $user_id = Auth::user()->id;
        $user = User::where('id', $user_id)->first();

        if (empty($user->email) && $request->path() != "api/password/send-reset-mail" && $request->path() != 'api/system/rules') {
            return DefaultResponse::HTTPErrorResponse(
                'É necessário cadastrar um email',
                ['REG_EMAIL'],
                403
            );
        }

        if (!$user->primeiro_login) {
            return $next($request);
        }

        return DefaultResponse::HTTPErrorResponse(
            DefaultMessages::FIRST_LOGIN_CHANGE_PASSWORD,
            ['CHG_PSW'],
            403
        );
    }
}
