import { message, Flex, Input, Button, Form, Result } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { sendResetPasswordMail } from "../../service/MailService";

interface ISizeComponent {
    size: string;
}

export function RegisterEmailForm({ size }: ISizeComponent) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [emailRegistered, setEmailRegistered] = useState<string>("");
    const [componentSize, setComponentSize] = useState<string>();

    useEffect(() => {
        setComponentSize(size);
    }, [size]);

    const handleRegisterEmail = async () => {
        try {
            setIsFetching(true);

            const values = await form.validateFields();

            await sendResetPasswordMail(values.email);

            setEmailRegistered(values.email);
            showMessage('Email enviado com sucesso! Verifique sua caixa de entrada.', 'success', 5);

        } catch (error: any) {
            if (error.errorFields) {
                showMessage('Por favor, corrija os campos destacados', 'warning');
            } else if (error.response) {
                const errorMessage = error.response?.data?.message || 'Erro ao enviar email';
                showMessage(errorMessage, 'error');
            } else {
                showMessage('Erro ao enviar email. Verifique sua conexão.', 'error');
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

    return (
        <>
            {contextHolder}
            {!emailRegistered ? (
                <Flex vertical style={{ padding: '2vh', width: componentSize }}>
                    <Form
                        form={form}
                        disabled={isFetching}
                        layout="vertical"
                        name="register-user-email"
                    >
                        <Form.Item
                            name="email"
                            label="E-mail:"
                            rules={[
                                {
                                    whitespace: true,
                                    message: 'Este campo não pode ficar em branco'
                                },
                                { required: true, message: 'O email não pode ficar vazio' },
                                { type: 'email', message: 'Este email não é válido' },
                            ]}
                        >
                            <Input placeholder="seu@email.com" />
                        </Form.Item>
                        <Form.Item
                            name="emailConfirmation"
                            label="Repita o email:"
                            dependencies={['email']}
                            rules={[
                                {
                                    whitespace: true,
                                    message: 'Este campo não pode ficar em branco'
                                },
                                { required: true, message: 'A confirmação do email é obrigatória' },
                                { type: 'email', message: 'Este email não é válido' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('email') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Os emails digitados não são iguais!'));
                                    },
                                }),
                            ]}
                        >
                            <Input placeholder="seu@email.com" />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                onClick={handleRegisterEmail}
                                type="primary"
                                htmlType="submit"
                                loading={isFetching}
                                block
                            >
                                Cadastrar email
                            </Button>
                        </Form.Item>
                    </Form>
                </Flex>
            ) : (
                <Result
                    status="success"
                    title="Email enviado com sucesso!"
                    subTitle={
                        <>
                            Um link foi enviado para <strong>{emailRegistered}</strong>.
                            <br />
                            Por favor, verifique sua caixa de entrada e clique no link para definir sua senha.
                            <br />
                            Se não encontrar, verifique também a caixa de spam.
                        </>
                    }
                    extra={[
                        <Button type="primary" key="back">
                            <Link to="/login">Voltar para Login</Link>
                        </Button>,
                        <Button
                            key="resend"
                            onClick={() => setEmailRegistered("")}
                        >
                            Reenviar email
                        </Button>
                    ]}
                />
            )}
        </>
    );
}