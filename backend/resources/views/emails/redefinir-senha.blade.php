<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* ... seus estilos ... */
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>{{ $appName }}</h2>
        </div>

        @if($username)
        <p>Olá, <strong>{{ $username }}</strong>!</p>
        @else
        <p>Olá!</p>
        @endif

        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p> {{-- ← Texto ajustado --}}

        <p style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Redefinir minha senha</a> {{-- ← Texto ajustado --}}
        </p>

        <p>Ou copie e cole este link no seu navegador:</p>
        <div class="link-box">
            {{ $resetUrl }}
        </div>

        <div class="warning">
            <strong>Importante:</strong> Este link é válido por 24 horas e pode ser usado apenas uma vez.
        </div>

        <div class="footer">
            <p>Se você não solicitou esta recuperação, por favor ignore este email e sua senha permanecerá inalterada.</p> {{-- ← Texto ajustado --}}
            <p>Dúvidas? Entre em contato conosco.</p>
        </div>
    </div>
</body>

</html>