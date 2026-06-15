<?php

namespace App\Http\Middleware;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\System;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/*  
    Middleware responsável não interceptar requisições e bloquea-las caso a plataforma
    esteja em estado de manutenção.
    
    Quando a coluna "em_manutencao" da tabela "sistema" for 
    1(verdadeiro), ninguem poderá logar, apenas o administrador.
    E todos os tokens dos usuários será revogado.
*/
class MaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $inMaintenanceMode = System::select('em_manutencao')->first();

        if (!$inMaintenanceMode || $inMaintenanceMode->em_manutencao != 1) {
            return $next($request);
        }

        if ($request->is('auth/login') || $request->is('api/auth/login') || $request->routeIs('login')) {
            $request->attributes->set('maintenance_mode', true);
            return $next($request);
        }

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->role === 'administrador') {
                return $next($request);
            }

            if ($request->user() && method_exists($request->user()->currentAccessToken(), 'delete')) {
                $request->user()->currentAccessToken()->delete();
            }

            return DefaultResponse::HTTPResponse(
                ['estimate' => $inMaintenanceMode->previsao_fim],
                DefaultMessages::MAINTENANCE_MODE,
                503
            );
        }

        return DefaultResponse::HTTPResponse(
            ['estimate' => $inMaintenanceMode->previsao_fim],
            DefaultMessages::MAINTENANCE_MODE,
            503
        );
    }
}
