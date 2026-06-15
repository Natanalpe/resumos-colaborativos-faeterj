import { Button, Form, Input, message, Modal, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import { createNews, deleteNews, updateNews } from "../../../service/NewsService";
import type { AxiosResponse } from "axios";
import TextArea from "antd/es/input/TextArea";
import type { NoticeType } from "antd/es/message/interface";

export type TNewsPropsData = {
    id: string,
    user_id?: string,
    created_at?: string,
    conteudo: string,
    titulo: string
};

interface IEditVisualizeModal {
    newsData: TNewsPropsData | undefined,
    isOpen: boolean,
    onClose: (wasSuccessfull: boolean, shouldReloadNews?: boolean) => void,
    isEditing: boolean
}

export const EditViewNews = ({ newsData, isOpen, onClose, isEditing }: IEditVisualizeModal) => {

    const [popConfirmOpen, setPopConfirmOpen] = useState(false);
    const [modalIsLoading, setModalIsLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen && newsData) {
            form.setFieldsValue({
                titulo: newsData.titulo,
                conteudo: newsData.conteudo
            });
        } else if (!isOpen) {
            form.resetFields();
        }
    }, [isOpen, newsData, form]);

    const cancelPopConfirm = () => {
        setPopConfirmOpen(false);
    };

    const showPopConfirm = () => {
        setPopConfirmOpen(true)
    };

    const handleDeleteNews = () => {
        setModalIsLoading(true);
        deleteNews(newsData?.id)
            .then((response: AxiosResponse) => {
                if (response.status == 204) {
                    setModalIsLoading(false);
                    onClose(true, true);
                } else {
                    setModalIsLoading(false);
                    showMessage('Falha ao deletar notícia', 'error');
                }
            })
    }

    const saveNews = (values: any) => {
        setModalIsLoading(true);
        updateNews(newsData?.id, values)
            .then((_: AxiosResponse) => {
                setModalIsLoading(false);
                onClose(true, true);
            })
            .catch((error: any) => {
                setModalIsLoading(false);

                if (error.response?.status == 422 && error.response?.data?.errors) {
                    const validationsErros = error.response.data.errors;

                    const errorsMessages = Object.entries(validationsErros)
                        .map(([_, messages]) => {
                            return `${(messages as string[]).join(', ')};`
                        })
                        .join('\n');

                    messageApi.error({
                        content: (
                            <div>
                                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                    Errors de validação:
                                </div>
                                <div>{errorsMessages}</div>
                            </div>
                        ),
                        duration: 5,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || 'Ocorreu um erro ao salvar',
                        duration: 5
                    });
                }
            })
    }

    const handleCreateNews = (values: any) => {
        setModalIsLoading(true);

        createNews(values)
            .then((_: AxiosResponse) => {
                setModalIsLoading(false);
                onClose(true, true)
            })
            .catch((error: any) => {
                setModalIsLoading(false);

                if (error.response?.status == 422 && error.response?.data?.errors) {
                    const validationErrors = error.response.data.errors;

                    const errorMessages = Object.entries(validationErrors)
                        .map(([_, messages]) => {
                            return `${(messages as string[]).join(', ')}`;
                        })
                        .join('\n');

                    messageApi.error({
                        content: (
                            <div>
                                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                    Erros de validação:
                                </div>
                                <div>{errorMessages}</div>
                            </div>
                        ),
                        duration: 5,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || 'Ocorreu um erro ao criar',
                        duration: 3
                    });
                }
            })
    }

    const showMessage = (content: string, type: NoticeType, showMessage: boolean = false) => {
        if (showMessage) {
            messageApi.open({
                type: type,
                content: content,
                duration: 3
            });
            message.config({ rtl: false });
        }
    }

    return (
        <>
            {contextHolder}
            <Modal
                title={isEditing ? "Editar notícia" : "Criar notícia"}
                open={isOpen}
                onCancel={() => onClose(false)}
                footer={[
                    <Space key='delete' style={{ marginRight: '8px' }}>
                        {isEditing && (
                            <Popconfirm title="Deseja realmente deletar?" open={popConfirmOpen} onCancel={cancelPopConfirm} onConfirm={handleDeleteNews} >
                                <Button color={modalIsLoading ? "default" : "danger"} variant={modalIsLoading ? "text" : "solid"} onClick={showPopConfirm} disabled={modalIsLoading}>
                                    Apagar
                                </Button>
                            </Popconfirm>

                        )}
                    </Space>,
                    <Button key="back" onClick={() => onClose(true)}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" htmlType="submit" onClick={() => { form.submit(); showMessage('Sucesso', "success") }} loading={modalIsLoading}>
                        {isEditing ? 'Salvar' : 'Criar'}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="Edit-view-news-form"
                    onFinish={isEditing ? saveNews : handleCreateNews}
                >
                    <Form.Item label="Título">
                        <Form.Item name="titulo" rules={[
                            {
                                whitespace: true,
                                message: 'Este campo não pode ficar em branco'
                            },
                            {
                                required: true,
                                message: 'Por favor, insira um título'
                            },
                            {
                                min: 3,
                                message: 'O título precisa ter pelo menos 3 caracteres'
                            },
                            {
                                max: 75,
                                message: 'O título não pode ultrapassar 75 caracteres'
                            }
                        ]}>
                            <Input placeholder="Título da notícia" count={{ max: 75, show: true }} />
                        </Form.Item>
                        <Form.Item label="Aviso">
                            <Form.Item name="conteudo" rules={[
                                {
                                    whitespace: true,
                                    message: 'Este campo não pode ficar em branco'
                                },
                                {
                                    required: true,
                                    message: 'Por favor, preencha o texto'
                                },
                                {
                                    min: 3,
                                    message: 'O texto precisa ter pelo menos 3 caracteres'
                                },
                                {
                                    max: 2000,
                                    message: 'O aviso não pode ultrapassar 2000 caracteres'
                                }
                            ]}>
                                <TextArea rows={10} count={{ max: 2000, show: true }} placeholder="Texto do aviso" />
                            </Form.Item>
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}