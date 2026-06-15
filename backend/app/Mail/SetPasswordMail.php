<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Mailable para mandar o email de mudar a senha
 */
class SetPasswordMail extends Mailable
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
        $resetUrl = "{$this->frontendUrl}/definir-senha?token={$this->token}";

        return $this->subject('Defina sua senha - ' . env('APP_NAME'))
            ->view('emails.set-password')
            ->with([
                'resetUrl' => $resetUrl,
                'username' => $this->username,
                'appName' => env('APP_NAME')
            ]);
    }
}
