<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Mailable para mandar o email de mudança de senha
 */
class PasswordResetMail extends Mailable
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
        return $this->subject('Redefina sua senha - ' . env('APP_NAME'))
            ->view('emails.reset-password')
            ->with([
                'resetUrl' => $resetUrl,
                'username' => $this->username,
                'appName' => env('APP_NAME')
            ]);
    }
}
