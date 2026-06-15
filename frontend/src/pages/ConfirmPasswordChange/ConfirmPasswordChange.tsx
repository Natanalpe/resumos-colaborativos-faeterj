import { message, Flex, Button, Result, Spin } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordChange } from "../../service/MailService";

export default function ConfirmPasswordChange() {
    const [messageApi, contextHolder] = message.useMessage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isConfirming, setIsConfirming] = useState<boolean>(true);
    const [success, setSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setIsConfirming(false);
            setErrorMessage('Token não encontrado na URL');
            return;
        }

        confirmPasswordChange(token)
            .then(() => {
                setSuccess(true);
                showMessage('Senha alterada com sucesso!', 'success', 5);

                setTimeout(() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    navigate('/login');
                }, 3000);
            })
            .catch((error) => {
                setSuccess(false);
                const errMsg = error.response?.data?.message || 'Token inválido ou expirado';
                setErrorMessage(errMsg);
                showMessage(errMsg, 'error');
            })
            .finally(() => {
                setIsConfirming(false);
            });
    }, [token]);

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration,
        });
    };

    if (isConfirming) {
        return (
            <Flex vertical align="center" justify="center" style={{ minHeight: '100vh' }}>
                {contextHolder}
                <Spin size="large" />
                <p style={{ marginTop: 16, fontSize: 16 }}>Confirmando mudança de senha...</p>
            </Flex>
        );
    }

    if (success) {
        return (
            <Flex vertical align="center" justify="center" style={{ minHeight: '100vh', padding: 20 }}>
                {contextHolder}
                <Result
                    status="success"
                    title="Senha Alterada com Sucesso!"
                    subTitle="Sua senha foi alterada. Você será redirecionado para a página de login em instantes. Por favor, faça login com sua nova senha."
                    extra={[
                        <Button type="primary" key="login">
                            <Link to="/login">Ir para Login Agora</Link>
                        </Button>
                    ]}
                />
            </Flex>
        );
    }

    return (
        <Flex vertical align="center" justify="center" style={{ minHeight: '100vh', padding: 20 }}>
            {contextHolder}
            <Result
                status="error"
                title="Erro ao Confirmar Mudança de Senha"
                subTitle={errorMessage || "O link que você está tentando acessar é inválido ou já expirou."}
                extra={[
                    <Button type="primary" key="home">
                        <Link to="/">Voltar para Início</Link>
                    </Button>,
                    <Button key="login">
                        <Link to="/login">Ir para Login</Link>
                    </Button>
                ]}
            />
        </Flex>
    );
}