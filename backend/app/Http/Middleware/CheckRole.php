<?php

namespace App\Http\Middleware;

use App\Http\Responses\DefaultMessages;
use Closure;
use Illuminate\Http\Request;

/**
 * Middleware responsável por fazer o controle das rotas.
 * Se um usuário não tiver permissão para acessar a rota X, é retornado
 * uma mensagem de 'não autorizado' e um código 401
 */
class CheckRole
{

    public function handle(Request $request, Closure $next, string $roles) {

        $allowesRoles = explode('|', $roles);
        
        if(!$request->user() || !in_array($request->user()->role, $allowesRoles)) {
            return response()->json([
                'status' => 401,
                'message' => DefaultMessages::NOT_AUTHORIZED,
            ], 401);
        }
        return $next($request);
    }
}
