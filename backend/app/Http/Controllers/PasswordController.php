<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Http\Responses\DefaultResponse;
use App\Http\Responses\DefaultMessages;
use App\Mail\RecoveryPasswordMail;
use App\Models\User;
use App\Validations\MailValidations;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;


/**
 * Controller utilizado para enviar email de mudança de senha e alterar a senha do usuário.
 */
class PasswordController extends Controller
{

    /**
     * Envia para o email do usuário um link para alterar sua senha.
     */
    public function sendRecoveryPasswordMail(Request $request)
    {
        try {
            // Valida os dados do corpo da requisição;
            $validator = MailValidations::validateMail($request);


            // Se as validações falharem retorna o primeiro erro, a mensagem validation error e um código 422.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            // Pega o email e busca o usuário dono do email;
            $email = $request->email;
            $user = User::where('email', $email)->first();

            // Se não houver um usuário com este email, retorna uma mensagem dizendo...
            // Não é dito que o emzil foi enviado ou não por segurança
            if (!$user) {
                return DefaultResponse::HTTPResponse(
                    [],
                    'Se o e-mail existir, você receberá um link de recuperação'
                );
            }

            // cria o token
            $token = Str::random(64);

            // Procura e deleta possíveis registros da tabela de reset de senhas.
            DB::table('password_resets')->where('email', $email)->delete();

            // Cria o registro de reset de senha no banco.
            DB::beginTransaction();
            DB::table('password_resets')->insert([
                'email' => $email,
                'token' => $token,
                'used' => false,
                'created_at' => now()
            ]);
            DB::commit();

            // Envia o email para o usuário.
            Mail::to($email)->send(new RecoveryPasswordMail($token, $user->nome));

            // Retorna um código 200 e uma mensagem de sucesso.
            return DefaultResponse::HTTPResponse(
                [],
                'Email de recuperação enviado com sucesso!'
            );
        } catch (Exception $e) {
            DB::rollBack();
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * QUando o usuário clica no link recuperação de senha no email, ele é redirecionado para o frontend e
     * o frontend manda para esta função o token para que seja validado.
     */
    public function validateRecoveryToken(Request $request)
    {
        try {
            // Pega o token do corpo da requisição.
            $token = $request->input('token');

            // Busca os dados do token na tabela de passwordResets
            $passwordReset = DB::table('password_resets')
                ->where('token', $token)
                ->where('used', false)
                ->first();

            // Se os dados não existirem, retorna um 404 com mensagem not found.
            if (!$passwordReset) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    'Token inválido ou expirado',
                    404
                );
            }

            /* Verifica se o token já está expirado. os tokens tem uma validade de 24 horas.
            *  De estiver expirado, retorna um codigo 422 com mensagem token expirado e mensagem validation error.
            */
            $createdAt = Carbon::parse($passwordReset->created_at);
            if ($createdAt->addHours(24)->isPast()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    'Token expirado',
                    422
                );
            }

            // Retorna o email com a mensagem token válido.
            return DefaultResponse::HTTPResponse(
                ['email' => $passwordReset->email],
                'Token válido'
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

    // Utilizado para alterar a senha
    public function resetPassword(Request $request)
    {
        try {
            // Valida o token e a senha no corpo da requisição.
            $validator = Validator::make($request->all(), [
                'token' => 'required',
                'password' => 'required|min:8|confirmed',
            ]);

            // Se houver falha nas validações retorna o código 422 com o primeiro erro e a mensagem validation error.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            // Busca o token e a senha no corpo da requisição.
            $token = $request->input('token');
            $newPassword = $request->input('password');

            // Busca os dados do reset de senha no banco.
            $passwordReset = DB::table('password_resets')
                ->where('token', $token)
                ->where('used', false)
                ->first();

            // Se não houver registros no banco retorna um código 404 e mensagem not found.
            if (!$passwordReset) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    'Token inválido',
                    404
                );
            }

            // BUsca o usuário dono do email.
            $user = User::where('email', $passwordReset->email)->first();

            // Se o usuário não existir, retorna um código 404 com mensagem not found.
            if (!$user) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    'Usuário não encontrado',
                    404
                );
            }

            DB::beginTransaction();

            // Cria a criptografia da senha. Altera o uso daprimeira senha como falso e salva os dados.
            $user->password = Hash::make($newPassword);
            $user->usando_primeira_senha = false;
            $user->save();

            DB::table('password_resets')
                ->where('token', $token)
                ->update(['used' => true]);

            DB::commit();

            // Retorna o código 200
            return DefaultResponse::HTTPResponse(
                [],
                'Senha alterada com sucesso!'
            );
        } catch (Exception $e) {
            DB::rollBack();
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }
}
