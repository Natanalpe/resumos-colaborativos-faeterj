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
            color: #f39c12;
            margin-bottom: 10px;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #f39c12;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }

        .button:hover {
            background-color: #e67e22;
        }

        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Confirme a mudança de senha</h2>
        </div>

        @if($username)
        <p>Olá, <strong>{{ $username }}</strong>!</p>
        @else
        <p>Olá!</p>
        @endif

        <p>Recebemos uma solicitação para alterar sua senha no <strong>{{ $appName }}</strong>.</p>

        <div class="warning">
            <strong>Atenção!</strong> Se você não solicitou esta mudança, simplesmente ignore este email e sua senha permanecerá a mesma e <strong>NÃO</strong> clique no botão abaixo.
        </div>

        <p>Para confirmar a mudança de senha, clique no botão abaixo:</p>

        <p style="text-align: center;">
            <a href="{{ $confirmUrl }}" class="button">Confirmar mudança de senha</a>
        </p>

        <p><strong>Este link é válido por 1 hora.</strong></p>
    </div>
</body>

</html>