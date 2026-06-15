<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use App\Models\Logs;
use App\Models\User;
use App\Models\System;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\PasswordChangeRequest;
use App\Http\Responses\DefaultResponse;
use App\Http\Responses\DefaultMessages;
use App\Mail\ConfirmPasswordChangeMail;
use App\Validations\AuthValidations;
use App\Validations\MaintenanceValidations;
use Illuminate\Support\Facades\Validator;

/**
 * Controller responsável pela autenticação de usuários
 *
 * Gerencia as operações de login e logout do sistema, incluindo
 * validação de credenciais, geração de tokens de acesso e 
 * registro de logs de ações.
 *
 * @package App\Http\Controllers
 * @author Natan Altomar <natan.altomar14@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 */
class AuthController extends Controller
{

    /**
     * Realiza a autenticação do usuário no sistema
     *
     * Este método verifica as credenciais do usuário (matrícula e senha),
     * valida o modo de manutenção (se ativo), gera um token de acesso
     * e registra a ação de login nos logs do sistema.
     *
     * @param Request $request Objeto da requisição HTTP contendo:
     *                         - matricula: string A matrícula do usuário
     *                         - password: string A senha do usuário
     *                         - keepLogged: bool|null Indica se o usuário deseja permanecer conectado
     *
     * @return \Illuminate\Http\JsonResponse Resposta JSON contendo:
     *         - Em caso de sucesso (200): token, username, role, id e first_login (se aplicável)
     *         - Em modo manutenção (503): estimate (previsão de fim da manutenção)
     *         - Em falha de autenticação (401): array vazio
     *         - Em erro interno (500): mensagem de erro
     *
     * @throws Exception Quando ocorre um erro inesperado durante o processo de autenticação
     *
     * @see DefaultResponse::HTTPResponse()
     * @see DefaultMessages
     * @see User
     * @see Logs
     *
     * @example
     * // Requisição básica
     * POST /api/login
     * {
     *     "matricula": "12345",
     *     "password": "senha123"
     * }
     *
     * @example
     * // Requisição com "manter conectado"
     * POST /api/login
     * {
     *     "matricula": "12345",
     *     "password": "senha123",
     *     "keepLogged": true
     * }
     */
    public function login(Request $request)
    {
        try {
            // Verifica se o sistema está em modo de manutenção
            if ($request->attributes->get('maintenance_mode')) {
                $user = User::where('matricula', $request->matricula)->first();
                $inMaintenanceMode = System::first();

                // Apenas administradores podem acessar durante manutenção
                if (!$user || $user->role !== 'administrador') {
                    return DefaultResponse::HTTPResponse(
                        ['estimate' => $inMaintenanceMode->previsao_fim],
                        DefaultMessages::MAINTENANCE_MODE,
                        503
                    );
                }
            }

            // Tenta autenticar o usuário
            if (Auth::attempt($request->only('matricula', 'password'))) {
                $user = Auth::user();

                // Remove tokens anteriores do usuário
                $user->tokens->each->delete();

                // Define o tempo de expiração do token
                $expiresAt = $request->keepLogged
                    ? now()->addWeeks(4)
                    : null;

                // Cria novo token de acesso
                $token = $request->user()->createToken('login_auth_token', ['*'], $expiresAt)->plainTextToken;

                $user = Auth::user();

                // Registra o login bem-sucedido nos logs
                Logs::create(['user_id' => $user->id, 'acao' => 'login', 'acao_ocorreu_com_sucesso' => 1]);

                $queryUser = User::where('id', $user->id)->first();

                if($queryUser->ativo == '0') {
                    return DefaultResponse::HTTPResponse(
                        [],
                        DefaultMessages::NOT_AUTHORIZED,
                        403
                    );
                }

                // Verifica se é o primeiro login do usuário
                if ($queryUser->primeiro_login == 1) {
                    $isFirstLogin = $queryUser->primeiro_login;
                    $queryUser->primeiro_login = 0;
                    $queryUser->save();

                    return DefaultResponse::HTTPResponse([
                        'token' => $token,
                        'username' => $user->nome,
                        'first_login' => $isFirstLogin,
                        'role' => $user->role,
                        'id' => $user->id
                    ], DefaultMessages::AUTHORIZED, 200);
                }

                return DefaultResponse::HTTPResponse([
                    'token' => $token,
                    'username' => $user->nome,
                    'role' => $user->role,
                    'id' => $user->id
                ], DefaultMessages::AUTHORIZED, 200);
            } else {
                return DefaultResponse::HTTPResponse([], DefaultMessages::NOT_AUTHORIZED, 401);
            }
        } catch (Exception $e) {
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Realiza o logout do usuário autenticado
     *
     * Este método invalida todos os tokens de acesso do usuário,
     * efetivamente desconectando-o do sistema, e registra a
     * ação nos logs.
     *
     * @param Request $request Objeto da requisição HTTP
     *
     * @return \Illuminate\Http\JsonResponse Resposta JSON:
     *         - Em caso de sucesso (204): sem conteúdo
     *         - Em caso de erro (500): mensagem de erro interno
     *
     * @see DefaultResponse::HTTPResponse()
     * @see Logs
     *
     * @example
     * // Requisição de logout
     * POST /api/logout
     * Headers: Authorization: Bearer {token}
     */
    public function logout(Request $request)
    {
        $user = Auth::user();
        try {
            // Remove todos os tokens do usuário
            $user->tokens->each->delete();

            // Registra o logout bem-sucedido nos logs
            Logs::create(['user_id' => $user->id, 'acao' => 'logout', 'acao_ocorreu_com_sucesso' => 1]);

            return DefaultResponse::HTTPResponse([], '', 204);
        } catch (Exception $e) {
            // Registra a falha no logout
            Logs::create(['user_id' => $user->id, 'acao' => 'logout', 'acao_ocorreu_com_sucesso' => 0]);
            return DefaultResponse::HTTPResponse([], DefaultMessages::INTERNAL_SERVER_ERROR, 500, $e->getMessage());
        }
    }

    /**
     * Solicita mudança de senha (envia email de confirmação)
     */
    public function requestPasswordChange(Request $request)
    {
        try {
            $user_id = Auth::user()->id;
            $user = User::where('id', $user_id)->first();

            if (!Hash::check($request->current_password, $user->password)) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::INVALID_PASSWORD,
                    [],
                    401
                );
            }

            if (empty($user->email)) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::EMAIL_NOT_FOUND,
                    [],
                    400
                );
            }

            $token = Str::random(64);

            // Remove solicitações antigas não confirmadas
            PasswordChangeRequest::where('user_id', $user->id)
                ->where('confirmado', false)
                ->delete();

            // Cria nova solicitação
            PasswordChangeRequest::create([
                'user_id' => $user->id,
                'token' => Hash::make($token),
                'hash_nova_senha' => Hash::make($request->new_password),
                'confirmed' => false,
                'created_at' => now()
            ]);

            // Envia email de confirmação
            Mail::to($user->email)->send(new ConfirmPasswordChangeMail($token, $user->nome));

            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::MAIL_SENT_SUCCESSFULLY
            );
        } catch (Exception $e) {
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Confirma a mudança de senha através do token do email
     */
    public function confirmPasswordChange(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string'
            ], [
                'token.required' => 'O token é obrigatório'
            ]);

            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            $token = $request->token;

            // Busca solicitações não confirmadas e não expiradas (1 hora)
            $requests = PasswordChangeRequest::where('confirmado', false)
                ->where('created_at', '>', Carbon::now()->subHour())
                ->get();

            $validRequest = null;
            foreach ($requests as $req) {
                if (Hash::check($token, $req->token)) {
                    $validRequest = $req;
                    break;
                }
            }

            if (!$validRequest) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::INVALID_TOKEN,
                    ['O token fornecido é inválido ou expirou.'],
                    400
                );
            }

            $user = User::find($validRequest->user_id);

            if (!$user) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    ['Não foi possível encontrar o usuário.'],
                    404
                );
            }

            $user->password = $validRequest->hash_nova_senha;
            $user->save();

            $validRequest->confirmado = true;
            $validRequest->save();

            return DefaultResponse::HTTPResponse(
                [],
                'Senha alterada com sucesso!'
            );
        } catch (Exception $e) {
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }
}
