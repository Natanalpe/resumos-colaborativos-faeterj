import { message, Flex, Input, Button, Form, Result, Spin } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type { NoticeType } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { validateMailToken, setPassword } from "../../service/MailService";

export default function SetPassword() {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [isValidating, setIsValidating] = useState<boolean>(true);
    const [tokenValid, setTokenValid] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [passwordSet, setPasswordSet] = useState<boolean>(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            showMessage('Token não encontrado na URL', 'error');
            setIsValidating(false);
            return;
        }

        validateMailToken(token)
            .then((response) => {
                setTokenValid(true);
                setEmail(response.data.data.email);
                showMessage('Token válido! Defina sua senha.', 'success');
            })
            .catch((error) => {
                setTokenValid(false);
                const errorMessage = error.response?.data?.message || 'Token inválido ou expirado';
                showMessage(errorMessage, 'error');
            })
            .finally(() => {
                setIsValidating(false);
            });
    }, [token]);

    const handleSetPassword = async () => {
        if (!token) return;

        try {
            setIsFetching(true);
            const values = await form.validateFields();

            await setPassword(token, values.password, values.password_confirmation);

            setPasswordSet(true);
            showMessage('Senha definida com sucesso!', 'success', 5);

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error: any) {
            if (error.errorFields) {
                showMessage('Por favor, corrija os campos destacados', 'warning');
            } else if (error.response) {
                const errorMessage = error.response?.data?.message || 'Erro ao definir senha';
                showMessage(errorMessage, 'error');
            } else {
                showMessage('Erro ao definir senha. Verifique sua conexão.', 'error');
            }
        } finally {
            setIsFetching(false);
        }
    };

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration,
        });
    };

    if (isValidating) {
        return (
            <Flex vertical align="center" justify="center" style={{ minHeight: '100vh' }}>
                {contextHolder}
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>Validando token...</p>
            </Flex>
        );
    }

    if (!tokenValid) {
        return (
            <Flex vertical align="center" justify="center" style={{ minHeight: '100vh', padding: 20 }}>
                {contextHolder}
                <Result
                    status="error"
                    title="Token Inválido ou Expirado"
                    subTitle="O link que você está tentando acessar é inválido ou já expirou. Por favor, solicite um novo link."
                    extra={[
                        <Button type="primary" key="register">
                            <Link to="/registeremail">Cadastrar novo email</Link>
                        </Button>,
                        <Button key="login">
                            <Link to="/login">Voltar para Login</Link>
                        </Button>
                    ]}
                />
            </Flex>
        );
    }

    if (passwordSet) {
        return (
            <Flex vertical align="center" justify="center" style={{ minHeight: '100vh', padding: 20 }}>
                {contextHolder}
                <Result
                    status="success"
                    title="Senha Definida com Sucesso!"
                    subTitle="Sua senha foi configurada. Você será redirecionado para a página de login em instantes."
                    extra={[
                        <Button type="primary" key="login">
                            <Link to="/login">Ir para Login</Link>
                        </Button>
                    ]}
                />
            </Flex>
        );
    }

    return (
        <Flex vertical align="center" justify="center" style={{ minHeight: '100vh', padding: 20 }}>
            {contextHolder}
            <div style={{ maxWidth: 400, width: '100%' }}>
                <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Definir Senha</h1>
                {email && <p style={{ textAlign: 'center', color: '#666' }}>Email: <strong>{email}</strong></p>}

                <Form
                    form={form}
                    disabled={isFetching}
                    layout="vertical"
                    name="set-password"
                >
                    <Form.Item
                        name="password"
                        label="Nova Senha"
                        rules={[
                            { required: true, message: 'A senha é obrigatória' },
                            { min: 8, message: 'A senha deve ter no mínimo 8 caracteres' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mínimo 8 caracteres"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password_confirmation"
                        label="Confirme a Senha"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'A confirmação da senha é obrigatória' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('As senhas não coincidem!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Repita a senha"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            onClick={handleSetPassword}
                            type="primary"
                            htmlType="submit"
                            loading={isFetching}
                            block
                        >
                            Definir Senha
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login">Voltar para Login</Link>
                    </div>
                </Form>
            </div>
        </Flex>
    );
}