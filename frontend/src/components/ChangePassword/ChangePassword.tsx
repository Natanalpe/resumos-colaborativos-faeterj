import { Modal, Form, Input, Button, Divider, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type { NoticeType } from "antd/es/message/interface";
import { useState } from "react";
import { requestPasswordChange, type IRequestPasswordChangeData } from "../../service/MailService";

const { Title, Text } = Typography;

interface IPropsChangePass {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePassword = ({ isOpen, onClose }: IPropsChangePass) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const values = await form.validateFields();

            const data: IRequestPasswordChangeData = {
                current_password: values['current-password'],
                new_password: values['new-password'],
                new_password_confirmation: values['confirmation-password']
            };

            await requestPasswordChange(data);

            setEmailSent(true);
            showMessage('Email de confirmação enviado! Verifique sua caixa de entrada.', 'success', 5);

            form.resetFields();

        } catch (error: any) {
            if (error.errorFields) {
                showMessage('Por favor, corrija os campos destacados', 'warning');
            } else if (error.response) {
                const errorMessage = error.response?.data?.message || 'Erro ao solicitar mudança de senha';
                showMessage(errorMessage, 'error');
            } else {
                showMessage('Erro ao solicitar mudança de senha. Verifique sua conexão.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration,
        });
    };

    const handleClose = () => {
        form.resetFields();
        setEmailSent(false);
        onClose();
    };

    return (
        <>
            {contextHolder}
            <Modal
                open={isOpen}
                onCancel={handleClose}
                closable
                footer={[
                    <div key="footer">
                        <Divider />
                        <Button onClick={handleClose}>
                            {emailSent ? 'Fechar' : 'Cancelar'}
                        </Button>
                    </div>
                ]}
                title={
                    <Title level={3} style={{ textAlign: "center", margin: 0 }}>
                        Mudar a senha
                    </Title>
                }
            >
                {!emailSent ? (
                    <Form
                        form={form}
                        name="change-password-form"
                        layout="vertical"
                        disabled={isLoading}
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="current-password"
                            label={<Text strong>Senha atual:</Text>}
                            rules={[
                                {
                                    whitespace: true,
                                    message: 'Este campo não pode ficar em branco'
                                },
                                { required: true, message: 'A senha atual é obrigatória' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Digite sua senha atual"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="new-password"
                            label={<Text strong>Nova senha:</Text>}
                            rules={[
                                {
                                    whitespace: true,
                                    message: 'Este campo não pode ficar em branco'
                                },
                                { required: true, message: 'A nova senha é obrigatória' },
                                { min: 8, message: 'A senha deve ter no mínimo 8 caracteres' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Digite sua nova senha"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmation-password"
                            label={<Text strong>Confirme a nova senha:</Text>}
                            dependencies={['new-password']}
                            rules={[
                                {
                                    whitespace: true,
                                    message: 'Este campo não pode ficar em branco'
                                },
                                { required: true, message: 'A confirmação da senha é obrigatória' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('new-password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('As senhas não coincidem!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirme sua nova senha"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={isLoading}
                            >
                                Solicitar mudança
                            </Button>
                        </Form.Item>

                        <Text type="secondary" style={{ fontSize: 12 }}>
                            * Você receberá um email de confirmação para concluir a mudança de senha.
                        </Text>
                    </Form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                        <Title level={4}>Email Enviado!</Title>
                        <Text>
                            Foi enviado um email de confirmação.
                            <br />
                            Clique no link do email para confirmar a mudança de senha.
                        </Text>
                        <div style={{
                            marginTop: 20,
                            padding: 15,
                            backgroundColor: '#fff3cd',
                            borderRadius: 8,
                            border: '1px solid #ffc107'
                        }}>
                            <Text type="warning" strong>
                                O link é válido por 1 hora
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};