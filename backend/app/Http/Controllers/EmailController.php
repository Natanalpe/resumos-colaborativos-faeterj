<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Mail\PasswordResetMail;
use App\Mail\SetPasswordMail;
use App\Models\PasswordResets;
use App\Models\User;
use App\Validations\MailValidations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

/**
 * Controller responsável pelo envio e controle de email
 * 
 * Gerencia as operações de envio de e-mail para definição e recuperação de senha
 * 
 * @package App\Http\Controllers
 * @author Natan Altomar <natan.altomar14@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 */
class EmailController extends Controller
{

    /**
     * Envia email para o usuário definir sua senha inicial
     * 
     * @param Request $request Objeto da requisição HTTP contendo:
     *                          - email: string Email do usuário
     * 
     * @return \Illuminate\Http\JsonResponse Resposta JSON contendo:
     *          - Mensagem de sucesso: Em caso de sucesso.
     *          - Mensagem de falha: Em caso de erros.
     * 
     * @throws Exception Quando ocorre algum erro ao enviar o e-mail.
     * 
     * @example
     * POST /api/send-set-password-mail
     * Body: {"email": "usuario@exemplo.com"}
     */
    public function sendSetPasswordMail(Request $request)
    {
        try {
            $email = null;
            $user = null;
            $user_id = Auth::user()->id;
            $user = User::where('id', $user_id)->first();

            // Verifica se o usuário está autenticado e possui o email no corpo da requisição.
            if (Auth::check() && $request->has('email')) {

                // Se o usuário já tem email, retorn um erro 400.
                if ($user->email) {
                    return DefaultResponse::HTTPErrorResponse(
                        'Email já cadastrado',
                        'Você já possui um email cadastrado.',
                        400
                    );
                }


                // Validações para o emila.
                $validator = Validator::make($request->all(), [
                    'email' => 'required|email|unique:users,email'
                ], [
                    'email.required' => 'O email é obrigatório',
                    'email.email' => 'O email deve ser válido',
                    'email.unique' => 'Este email já está em uso'
                ]);


                // Se houver falhas na validação retorna um 422 com validation error
                if ($validator->fails()) {
                    return DefaultResponse::HTTPErrorResponse(
                        'Erro de validação',
                        $validator->errors()->first(),
                        422
                    );
                }

                $email = $request->email;

                $user->email = $email;
                $user->save();
            } else if ($request->has('email')) {
                // Validações para o email.
                $validator = Validator::make($request->all(), [
                    'email' => 'required|email|exists:users,email'
                ], [
                    'email.required' => 'O email é obrigatório',
                    'email.email' => 'O email deve ser válido',
                    'email.exists' => 'Este email não está cadastrado no sistema'
                ]);


                // Se houver erro na validaçõa retorna um 422 com validation error.
                if ($validator->fails()) {
                    return DefaultResponse::HTTPErrorResponse(
                        DefaultMessages::VALIDATION_ERROR,
                        $validator->errors()->first(),
                        422
                    );
                }

                $email = $request->email;
                // Busca o usuário do email
                $user = User::where('email', $email)->first();

                // Se o usuário não está utilizando a primeira senha, retorn aum codigo 400.
                if ($user->password && !$user->usando_primeira_senha) {
                    return DefaultResponse::HTTPErrorResponse(
                        'Senha já definida',
                        'Este usuário já possui uma senha definida. Use a recuperação de senha se necessário.',
                        400
                    );
                }
            } else {
                // Se não for enviado o email no corpo da requisição retorna um erro 400.
                return DefaultResponse::HTTPErrorResponse(
                    'Email obrigatório',
                    'É necessário fornecer um email.',
                    400
                );
            }

            // Cria o token com 64 caracteres.
            $token = Str::random(64);

            // Remove os dados de reset de senha associado ao email do banco.
            PasswordResets::where('email', $email)->delete();

            // Cria o registro no banco.
            PasswordResets::insert([
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]);

            // Envia o email para o usuário.
            Mail::to($email)->send(new SetPasswordMail($token, $user->nome ?? null));

            // Retrna um codigo 200.
            return DefaultResponse::HTTPResponse(
                [],
                'Email enviado com sucesso! Verifique sua caixa de entrada.'
            );
        } catch (Exception $e) {
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Valida o token recebido
     * 
     * @param Request $request Objeto da requisição HTTP contendo:
     *                          - token: string Token gerado no envio do email
     * 
     * @return \Illuminate\Http\JsonResponse Resposta JSON contendo:
     *          - valid: boolean Se o token é válido
     *          - email: string Email associado ao token (se válido)
     * 
     * @throws Exception Quando ocorre algum erro na validação.
     * 
     * @example
     * POST /api/validate-token
     * Body: {"token": "abc123xyz..."}
     */
    public function validateToken(Request $request)
    {
        try {
            // Valida o token do corpo da requisição;
            $validator = Validator::make($request->all(), [
                'token' => 'required|string'
            ], [
                'token.required' => 'O token é obrigatório'
            ]);

            // Se houver falha na validação retorna um 422 com o error e um validation error como mensagem;
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            // Pega o token da requisiçao.
            $token = $request->token;

            // Busca tokens não usados e não expirados (até24 horas)
            $passwordResets = DB::table('password_resets')
                ->where('used', false)
                ->where('created_at', '>', Carbon::now()->subHours(24))
                ->get();

            // Verifica/valida se o token está correto.
            foreach ($passwordResets as $reset) {
                if (Hash::check($token, $reset->token)) {
                    return DefaultResponse::HTTPResponse(
                        [
                            'valid' => true,
                            'email' => $reset->email
                        ],
                        DefaultMessages::VALID_TOKEN
                    );
                }
            }

            // Se não for valido, retorna um invalid token e 400
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INVALID_TOKEN,
                ['O token fornecido é inválido ou expirou.'],
                400
            );
        } catch (Exception $e) {

            // Em caso de falha, retorna um 500 com internal serve error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Define a senha do usuário
     * 
     * @param Request $request Objeto da requisição HTTP contendo:
     *                          - token: string Token recebido no email
     *                          - password: string Nova senha
     *                          - password_confirmation: string Confirmação da senha
     * 
     * @return \Illuminate\Http\JsonResponse Resposta JSON contendo:
     *          - Mensagem de sucesso ou erro
     * 
     * @throws Exception Quando ocorre algum erro ao definir a senha.
     * 
     * @example
     * POST /api/set-password
     * Body: {
     *   "token": "abc123xyz...",
     *   "password": "Senha123",
     *   "password_confirmation": "SenhaForte123!"
     * }
     */
    public function setPassword(Request $request)
    {
        try {
            // Validações para o corpo da requisição.
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed'
            ], [
                'token.required' => 'O token é obrigatório',
                'password.required' => 'A senha é obrigatória',
                'password.min' => 'A senha deve ter no mínimo 8 caracteres',
                'password.confirmed' => 'As senhas não coincidem'
            ]);

            // Se houver falha na validação, retorna o primeir arro, codigo 422 e um validation error.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            // Pega o token da requisição e a senha.
            $token = $request->token;
            $password = $request->password;

            // Busca e valida token
            $passwordResets = DB::table('password_resets')
                ->where('used', false)
                ->where('created_at', '>', Carbon::now()->subHours(24))
                ->get();

            $validReset = null;
            // Valida o token
            foreach ($passwordResets as $reset) {
                if (Hash::check($token, $reset->token)) {
                    $validReset = $reset;
                    break;
                }
            }

            // Se o token não for valido retorna um erro 400 com invalid token.
            if (!$validReset) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::INVALID_TOKEN,
                    ['O token fornecido é inválido ou expirou.'],
                    400
                );
            }

            // Atualiza a senha do usuário
            $user = User::where('email', $validReset->email)->first();

            if (!$user) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND['Não foi possível encontrar o usuário.'],
                    404
                );
            }

            // Atualiza a senha e marca que não é mais o primeiro login
            $user->password = Hash::make($password);
            $user->primeiro_login = false;
            $user->save();

            // Marca o token como usado
            DB::table('password_resets')
                ->where('email', $validReset->email)
                ->update(['used' => true]);

            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::OK
            );
        } catch (Exception $e) {
            // Em caso de falha, retorna um 500 e internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    /**
     * Usado para recuperar a senha.
     * Envia um link para o email do usuário com um token, 
     * e clicando no link será redirecionado para a plataforma para mudar a senha.
     */
    public function sendRecoveryPasswordMail(Request $request)
    {
        try {
            // Valida os dados do corpo da requisição
            $validator = MailValidations::validateMail($request);

            // Se houver falha na validaçõa retorna um erro validation error um 422 e o primerio erro.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            // Busca o usuário pelo email e cria o token.
            $email = $request->email;
            $user = User::where('email', $email)->first();
            $token = Str::random(64);

            // Para remover tokens antigos
            PasswordResets::where('email', $email)->delete();
            DB::beginTransaction();
            DB::table('password_resets')->insert([
                'email' => $email,
                'token' => Hash::make($token),
                'used' => false,
                'created_at' => now()
            ]);
            DB::commit();
            
            // Envia o email.
            Mail::to($email)->send(new SetPasswordMail($token, $user->nome));
            
            // Retorna um codigo 200.
            return DefaultResponse::HTTPResponse(
                [],
                'Email de recuperação enviado com sucesso!'
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Em caso de falha retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }


    /**
     * Usado para enviar um linnk para o email do usuário para alterar a senha.
     */
    public function sendPasswordResetLink(Request $request)
    {
        try {

            // Cria um token, busca o usuário autenticado e seu email
            $token = Str::random(64);
            $user_id = Auth::user()->id;
            $user = User::where('id', $user_id)->first();
            $user_email = $user->email;

            // Envia o email
            Mail::to($user_email)->send(new PasswordResetMail($token, $user->nome ?? null));

            return DefaultResponse::HTTPResponse(
                [],
                'Email enviado com sucesso! Verifique sua caixa de entrada.'
            );
        } catch (Exception $e) {
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }
}
