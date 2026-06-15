import Sider from "antd/es/layout/Sider";
import { useEffect, useRef, useState } from "react";
import Title from "antd/es/typography/Title";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Content } from "antd/es/layout/layout";
import { Button, Checkbox, Col, Form, Image, Input, Layout, message, Modal, Row } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import txtImage from '../../assets/images/text.png';
import mapaImage from '../../assets/images/mapa.png';
import resumoImage from '../../assets/images/resumo.png';
import { contentStyle, siderStyle, inputStyle, buttonStyle, LoginBackgroundAnimation, Square, formContainerStyle } from "./Style";
import { useSetUser } from "../../utils/SetUser";
import { loginService } from "../../service/auth/AuthService";
import type { AxiosResponse } from "axios";
import { useAuth } from "../../context/AuthContext";
import type { NoticeType } from "antd/es/message/interface";
import dayjs from "dayjs";
import { sendRecoveryPasswordMail } from "../../service/PasswordService";

interface ILoginForm {
    matricula: string,
    password: string,
    keepLogged?: boolean
}

export default function Login() {
    let navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const [formRecoveryMail] = Form.useForm();

    const [keepLogged, setKeepLogged] = useState<boolean>(false);
    const [isLoadingLoginAttempt, setIsLoadingLoginAttempt] = useState(false);
    const [_, setRotateRight] = useState<boolean>(true);
    const [isModalRemenberOpen, setIsModalRemenberOpen] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isSendingMail, setIsSendingMail] = useState<boolean>(false);
    const [emailRecoverySended, setEmailRecoverySended] = useState<boolean>(false);

    const { setUser: setAuthUser } = useAuth();
    const { setUser: setLocalUser } = useSetUser();

    const hasNavigated = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            const redirectPath = searchParams.get('redirect');
            navigate(redirectPath || '/', { replace: true });
            return;
        }

        const interval = setInterval(() => {
            setRotateRight(prev => !prev);
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    const handleLogin = (values: ILoginForm) => {
        setIsLoadingLoginAttempt(true);

        loginService({ ...values, keepLogged })
            .then((response: AxiosResponse) => {

                if (response.status == 200) {

                    const isFirstLogin = response.data.data.first_login && response.data.data.first_login == 1;

                    setLocalUser(
                        response.data.data.token,
                        response.data.data.role,
                        keepLogged,
                        response.data.data.id,
                        response.data.data.username
                    );

                    setAuthUser({
                        token: response.data.data.token,
                        role: response.data.data.role,
                        user_id: response.data.data.id,
                        username: response.data.data.username
                    });

                    const redirectPath = searchParams.get('redirect');

                    if (isFirstLogin) {
                        sessionStorage.setItem('firstLogin', 'true');
                        if (redirectPath) {
                            sessionStorage.setItem('loginRedirect', redirectPath);
                        }
                        navigate('/primeiroacesso', { replace: true });
                    } else {
                        const finalPath = redirectPath && redirectPath !== '/' ? redirectPath : '/';
                        navigate(finalPath, { replace: true });
                    }

                } else if (response.status == 403 || response.status == 401) {
                    showMessage("Matrícula ou senha incorreta(s).", 'warning');
                    setIsLoadingLoginAttempt(false);
                }
            })
            .catch((err) => {
                const formattedDate = dayjs(err.response.data.data.estimate).format("DD/MM/YYYY [às] HH:mm");
                if (err.response.data.status == 503 && err.response.data.message == "Em manutenção") {
                    showMessage(`Em manutenção. A manutenção será finalizada em: ${formattedDate}`, "warning", 5);
                } else {
                    showMessage("Matrícula ou senha incorreta(s).", "warning");
                }
            })
            .finally(() => {
                setIsLoadingLoginAttempt(false);
            });
    }

    useEffect(() => {
        if (hasNavigated.current) return;

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            hasNavigated.current = true;
            const redirectPath = searchParams.get('redirect');
            navigate(redirectPath || '/', { replace: true });
            return;
        }

        const interval = setInterval(() => {
            setRotateRight(prev => !prev);
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    const showMessage = (msg: string, type: NoticeType, duration: number = 5) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration,
        });
        message.config({ rtl: false });
    };

    const openModalRemenberPassword = () => setIsModalRemenberOpen(true);
    const closeModalRemenberPassword = () => {
        formRecoveryMail.resetFields();
        setEmailRecoverySended(false);
        setIsModalRemenberOpen(false)
        setIsSendingMail(false);
    };

    const handleSendMail = async () => {
        alert('1');
        try {
            const values = await formRecoveryMail.validateFields();
            alert(values);
            setIsSendingMail(true);
            
            const response = await sendRecoveryPasswordMail(values['email-remenber']);
            alert('2');
            alert(response);

            if (response.status === 200) {
                setEmailRecoverySended(true);
                formRecoveryMail.resetFields();
            }
        } catch (error) {
            console.log('Erro:', error);
            showMessage('Erro ao enviar e-mail', 'error');
        } finally {
            setIsSendingMail(false);
        }
    }

    return (
        <>
            <Layout style={{ minHeight: '100vh' }}>
                {contextHolder}
                <Row style={{ width: '100%', minHeight: '100vh' }}>
                    <Col xs={0} md={0} lg={14} xl={14} xxl={14}>
                        <Sider width="100%" style={siderStyle}>
                            <LoginBackgroundAnimation>
                                <Square className="r" rotateRight={true} delay="-6s">
                                    <Image loading="lazy" src={resumoImage} width='100%' preview={false} />
                                </Square>
                                <Square className="g" rotateRight={false} delay="-3s">
                                    <Image loading="lazy" src={mapaImage} width='100%' preview={false} />
                                </Square>
                                <Square className="b" rotateRight={true} delay="0s">
                                    <Image loading="lazy" src={txtImage} width='100%' preview={false} />
                                </Square>
                            </LoginBackgroundAnimation>
                        </Sider>
                    </Col>

                    <Col xs={24} md={24} lg={10} xl={10} xxl={10}>
                        <Content style={contentStyle}>
                            <div style={formContainerStyle}>
                                <Form
                                    autoComplete="on"
                                    form={form}
                                    onFinish={handleLogin}
                                    disabled={isLoadingLoginAttempt}
                                    layout="vertical"
                                >
                                    <Title level={1} style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        ENTRAR
                                    </Title>

                                    <Form.Item
                                        name="matricula"
                                        rules={[{ required: true, message: "Por favor, preencha o campo 'matrícula'." }]}
                                    >
                                        <Input
                                            style={inputStyle}
                                            placeholder="Matrícula"
                                            prefix={<UserOutlined />}
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[{ required: true, message: "Por favor, preencha o campo 'Senha'." }]}
                                    >
                                        <Input.Password
                                            style={inputStyle}
                                            placeholder="Senha"
                                            prefix={<LockOutlined />}
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Checkbox onChange={(e) => setKeepLogged(e.target.checked)}>
                                            Permanecer conectado (30 dias)
                                        </Checkbox>
                                    </Form.Item>

                                    <Form.Item style={{ textAlign: 'center' }}>
                                        <Button
                                            htmlType="submit"
                                            type="primary"
                                            style={buttonStyle}
                                            disabled={isLoadingLoginAttempt}
                                            size="large"
                                            block
                                        >
                                            Entrar
                                        </Button>
                                    </Form.Item>

                                    <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                                        <Button
                                            type="link"
                                            onClick={openModalRemenberPassword}
                                        >
                                            Esqueci minha senha
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Content>
                    </Col>
                </Row>
            </Layout>

            <Modal
                open={isModalRemenberOpen}
                onCancel={closeModalRemenberPassword}
                title="Lembrar minha senha"
                footer={[
                    <Button key="back" disabled={isSendingMail} onClick={closeModalRemenberPassword}>
                        Voltar
                    </Button>,
                    <>
                        {!emailRecoverySended && (
                            <Button key="submit" type="primary" loading={isSendingMail} onClick={handleSendMail}>
                                Enviar
                            </Button>
                        )}
                    </>
                ]}
            >
            </Modal>
        </>
    );
}