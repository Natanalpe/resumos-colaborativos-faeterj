<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }

        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        h2 {
            color: #4CAF50;
            margin-bottom: 10px;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }

        .button:hover {
            background-color: #45a049;
        }

        .link-box {
            word-break: break-all;
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-size: 12px;
        }

        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
        }
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

        <p>Você está recebendo este e-mail pois foi requerido uma mudança de senha em sua conta. Se não foi você, pode ignora-lo.</p>

        <p>Para criar uma nova senha, clique no botão abaixo:</p>

        <p style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Definir Minha Senha</a>
        </p>

        <p>Ou copie e cole este link no seu navegador:</p>
        <div class="link-box">
            {{ $resetUrl }}
        </div>

        <div class="warning">
            <strong>Importante:</strong> Este link é válido por 24 horas.
        </div>
    </div>
</body>

</html>