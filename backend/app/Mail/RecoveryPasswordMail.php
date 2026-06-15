<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Mailable para mandar o email de recuperar senha
 */
class RecoveryPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $username;

    public function __construct($token, $username = null)
    {
        $this->token = $token;
        $this->username = $username;
    }

    public function build()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $resetUrl = "{$frontendUrl}/recuperar-senha?token={$this->token}";

        return $this->subject('Recuperação de Senha - ' . env('APP_NAME'))
            ->view('emails.redefinir-senha')
            ->with([
                'resetUrl' => $resetUrl,
                'username' => $this->username,
                'appName' => env('APP_NAME')
            ]);
    }
}
