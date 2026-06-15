import { SaveOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, message, Modal } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { createCollection } from "../../service/CollectionsService";

interface IModalProps {
    isOpen: boolean,
    onClose: (shouldReload: boolean) => void
};

interface IDataCollection {
    nome: string
};

export function CreateCollection({ isOpen, onClose }: IModalProps) {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [isFetching, setIsFetching] = useState<boolean>(false);

    const closeAndResetFields = (shouldReload: boolean) => {
        form.resetFields();
        onClose(shouldReload);
    }

    const handleCreateCollection = async () => {
        setIsFetching(true)

        try {

            const values = await form.validateFields();

            const data: IDataCollection = {
                nome: values['nome']
            }

            await createCollection(data);

            showMessage('Coleção criada com sucesso', 'success', 2, () => closeAndResetFields(true));


        } catch (error: any) {
            if (error.errorFields) {
                showMessage('Por favor, corrija os campos destacados', 'warning');
            } else if (error.response) {
                const errorMessage = error.response?.data?.message || 'Erro criar coleção';
                showMessage(errorMessage, 'error');
            } else {
                showMessage('Erro criar coleção.', 'error');
            }
        } finally {
            setIsFetching(false);
        }

    }

    const showMessage = (msg: string, type: NoticeType, duration: number = 3, func?: () => void) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        }).then(() => {
            if (func) {
                func();
            }
        });
    }

    return (
        <>
            {contextHolder}
            <Modal
                open={isOpen}
                onCancel={() => onClose(false)}
                title={<><Title level={3} style={{ justifySelf: 'center' }}>Adicionar coleção</Title><Divider /></>}
                footer={[
                    <Button onClick={() => onClose(false)}>Cancelar</Button>,
                ]}
            >
                <Form
                    form={form}
                    name="create-collection"
                    onFinish={handleCreateCollection}
                    layout="vertical"
                    disabled={isFetching}
                >
                    <Form.Item
                        name="nome"
                        rules={[
                            { required: true, message: 'Preencha o campo do nome' },
                            { whitespace: true, message: 'O nome não pode conter apenas espaços' },
                            { max: 255, message: 'Máximo de 255 caracteres' },
                            {
                                validator: (_, value) => {
                                    const trimmedValue = value?.trim();
                                    if (trimmedValue && trimmedValue.length < 3) {
                                        return Promise.reject('Mínimo de 3 caracteres');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        normalize={(value) => value.trim()}
                        label="Nome da colação:"
                    >
                        <Input placeholder="Nome" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={isFetching}
                            icon={<SaveOutlined />}
                        >
                            Criar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}