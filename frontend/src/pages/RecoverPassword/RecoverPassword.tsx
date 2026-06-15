import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Flex, Form, Input, message, Result, Spin } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { resetPassword, validateRecoveryToken } from "../../service/PasswordService";


export function RecoverPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [resetting, setResetting] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            message.error('Token não fornecido');
            navigate('/login');
            return;
        }

        validateRecoveryToken(token)
            .then((response: any) => {
                setTokenValid(true);
                setEmail(response.data.data.email);
            })
            .catch(() => {
                message.error('Token inválido ou expirado');
                setTokenValid(false);
            })
            .finally(() => {
                setValidating(false);
            });
    }, [token, navigate]);

    const handleSubmit = async (values: any) => {
        setResetting(true);
        
        try {
            await resetPassword(token!, values.password, values.password_confirmation);
            setSuccess(true);
            message.success('Senha alterada com sucesso!');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            message.error('Erro ao redefinir senha');
        } finally {
            setResetting(false);
        }
    };

    if (validating) {
        return (
            <Flex justify="center" align="center" style={{ height: '100vh' }}>
                <Spin size="large" tip="Validando token..." />
            </Flex>
        );
    }

    if (!tokenValid) {
        return (
            <Flex justify="center" align="center" style={{ height: '100vh' }}>
                <Result
                    status="error"
                    title="Token inválido ou expirado"
                    subTitle="Solicite um novo link de recuperação"
                    extra={
                        <Button type="primary" onClick={() => navigate('/login')}>
                            Voltar ao login
                        </Button>
                    }
                />
            </Flex>
        );
    }

    if (success) {
        return (
            <Flex justify="center" align="center" style={{ height: '100vh' }}>
                <Result
                    status="success"
                    title="Senha redefinida com sucesso!"
                    subTitle="Você será redirecionado para o login..."
                    extra={
                        <Button type="primary" onClick={() => navigate('/login')}>
                            Ir para login
                        </Button>
                    }
                />
            </Flex>
        );
    }

    return (
        <Flex justify="center" align="center" style={{ height: '100vh', background: '#f0f2f5' }}>
            <Card title="Redefinir Senha" style={{ width: 400 }}>
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item label="E-mail">
                        <Input value={email} disabled />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Nova Senha"
                        rules={[
                            { required: true, message: 'Digite a nova senha' },
                            { min: 8, message: 'Mínimo 8 caracteres' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="password_confirmation"
                        label="Confirmar Senha"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Confirme a senha' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('As senhas não coincidem'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={resetting}>
                            Redefinir Senha
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    );
}