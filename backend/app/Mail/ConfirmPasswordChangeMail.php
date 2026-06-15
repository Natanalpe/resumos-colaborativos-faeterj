<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Mailable para enviar o email de confirmar a mudança de senha
 */
class ConfirmPasswordChangeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $frontendUrl;
    public $username;

    public function __construct($token, $username = null)
    {
        $this->token = $token;
        $this->username = $username;
        $this->frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
    }

    public function build()
    {
        $confirmUrl = "{$this->frontendUrl}/confirmar-mudanca-senha?token={$this->token}";

        return $this->subject('Confirme a mudança de senha - ' . env('APP_NAME'))
            ->view('emails.confirm-password-change')
            ->with([
                'confirmUrl' => $confirmUrl,
                'username' => $this->username,
                'appName' => env('APP_NAME')
            ]);
    }
}
