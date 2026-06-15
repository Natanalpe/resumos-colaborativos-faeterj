import { message, Modal, Space, Popconfirm, Layout, Button, Form, Switch, Input, TreeSelect, Flex } from "antd";
import { useEffect, useState, type SetStateAction } from "react";
import { disableUser, enableUser, getUserById, updateUserStudent } from "../../../service/UsersService";
import type { TsingleUserResponse, TUser } from "../../../types/UserType";
import type { NoticeType } from "antd/es/message/interface";
import { formEditUserStudentStyle } from "./Styles";
import { NO_MARGIN } from "../../../Global/Styles";
import Title from "antd/es/typography/Title";

interface IEditVisualizeModal {
    userData: TUserPropsData,
    isOpen: boolean,
    onClose: (successfull: boolean, shouldReload: boolean) => void
};

export type TUserPropsData = {
    id: string,
};

export const EditViewUser = ({ userData, isOpen, onClose }: IEditVisualizeModal) => {

    const [messageApi, contextHolder] = message.useMessage();
    const [popConfirmOpen, setPopConfirmOpen] = useState(false);
    const [deletionReason, setDeletionReason] = useState<SetStateAction<any>>();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletionReasons, setDeletionReasons] = useState<any>();

    const [isLoadingModal, setIsLoadingModal] = useState(false);

    const [userInfoData, setUserInfoData] = useState<TUser>();

    const [form] = Form.useForm();

    const baseDeletionReasons: any = [
        {
            value: 'outro',
            title: 'Sem motivo'
        },
    ];

    const studentDeletionReasons: any = [
        {
            value: 'aluno_abandonou_curso',
            title: 'Aluno abandonou o curso'
        },
        {
            value: 'aluno_concluiu_curso',
            title: 'Aluno concluiu o curso'
        },
        {
            value: 'aluno_trancou_curso',
            title: 'Aluno trancou o curso'
        }
    ];

    useEffect(() => {
        if (userInfoData?.role === 'aluno') {
            setDeletionReasons([...baseDeletionReasons, ...studentDeletionReasons]);
        } else {
            setDeletionReasons(baseDeletionReasons);
        }
    }, [userInfoData]);

    useEffect(() => {
        if (isOpen && userData?.id) {
            loadUserData();
        } else {
            form.resetFields();
            setDeletionReasons(baseDeletionReasons);
        }
    }, [isOpen, userData?.id]);

    const loadUserData = () => {
        setIsLoadingModal(true);
        getUserById(userData?.id)
            .then((response: TsingleUserResponse) => {
                setIsLoadingModal(false);
                setUserInfoData(response.data.data);

                form.setFieldsValue({
                    nome: response.data.data.nome,
                    sobrenome: response.data.data.sobrenome,
                    matricula: response.data.data.matricula,
                    ativo: response.data.data.ativo,
                    pode_postar: response.data.data.pode_postar
                });
            })
            .catch(() => {
                showMessage('Falha ao carregar dados do usuário.', 'error');
                setIsLoadingModal(false);
            });
    };

    const showMessage = (content: string, type: NoticeType) => {
        messageApi.open({
            type: type,
            content: content,
            duration: 3
        });
    };

    const handleUpdateUser = () => {
        setIsLoadingModal(true);
        updateUserStudent(form.getFieldsValue(), userData.id)
            .then((_: TsingleUserResponse) => {

                messageApi.success({
                    content: 'Salvo com sucesso',
                    duration: 1
                })
                    .then(() => {
                        setIsLoadingModal(false);
                        onClose(true, true);
                    });
            })
            .catch((error: any) => {
                if (error.response?.status == 422 && error.response?.data.errors) {
                    const validationsErrors = error.response.data.errors;

                    const errorsMessages = Object.entries(validationsErrors)
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
                                <div>{errorsMessages}</div>
                            </div>
                        ),
                        duration: 5,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: 'Ocorreu um erro ao salvar',
                        duration: 5
                    })
                }
                setIsLoadingModal(false);
            });
    }

    const openPopConfirmDeletion = () => {
        setPopConfirmOpen(true);
        setIsLoadingModal(true);
    }

    const closePopConfirmDeletion = () => {
        setPopConfirmOpen(false);
        setIsLoadingModal(false);
    }

    const confirmDisable = () => {
        setIsDeleting(true);

        let dataBody = {
            razao_da_desativacao: deletionReason == '' || deletionReason == undefined ? 'outro' : deletionReason
        };
        disableUser(dataBody, userInfoData?.id)
            .then(() => {
                messageApi.open({
                    type: 'success',
                    content: 'Usuário desativado com sucesso',
                    duration: 1
                })
                    .then(() => {
                        setIsLoadingModal(false);
                        setPopConfirmOpen(false);
                        form.resetFields();
                        setIsDeleting(false);
                        onClose(true, true);
                    });
            })
            .catch((error: any) => {
                setIsLoadingModal(false);
                setIsDeleting(false);
                if (error.response?.status == 422 && error.response?.data?.errors) {
                    const validationsErrors = error.response.data.errors;

                    const errorMessages = Object.entries(validationsErrors)
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
                        duration: 3,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || 'Ocorreu um erro ao desabilitar o usuário.',
                        duration: 3
                    });
                }
            });
    }

    const confirmEnable = () => {
        setIsDeleting(true);

        let dataBody = {
            razao_da_desativacao: null
        };

        enableUser(dataBody, userInfoData?.id)
            .then(() => {
                messageApi.open({
                    type: 'success',
                    content: 'Usuário ativado com sucesso',
                    duration: 1
                })
                    .then(() => {
                        setIsLoadingModal(false);
                        setPopConfirmOpen(false);
                        form.resetFields();
                        setIsDeleting(false);
                        onClose(true, true);
                    });
            })
            .catch((error: any) => {
                setIsLoadingModal(false);
                setIsDeleting(false);
                if (error.response?.status == 422 && error.response?.data?.errors) {
                    const validationsErrors = error.response.data.errors;

                    const errorMessages = Object.entries(validationsErrors)
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
                        duration: 3,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || 'Ocorreu um erro ao habilitar o usuário.',
                        duration: 3
                    });
                }
            });
    }

    return (
        <>
            {contextHolder}
            <Modal
                title={`Editando ${userInfoData?.nome ?? 'usuário'}`}
                open={isOpen}
                onCancel={() => onClose(false, false)}
                footer={[
                    <>
                        <Space key='disable' style={{ marginRight: '8px' }}>
                            <Popconfirm
                                disabled={isDeleting}
                                title={`Deseja realmente ${userInfoData?.ativo ? 'des' : ''}ativar este usuário?`}
                                open={popConfirmOpen}
                                onCancel={closePopConfirmDeletion}
                                onConfirm={userInfoData?.ativo ? confirmDisable : confirmEnable}
                                okText="Sim"
                                cancelText="não"
                                description={
                                    <>
                                        <Flex vertical style={{ padding: '2vh' }}>
                                            {userInfoData?.ativo ? (
                                                <>
                                                    <Title level={5} style={{ marginTop: '2vh' }}>Selecione o motivo da desativação</Title>
                                                    <TreeSelect
                                                        showSearch
                                                        defaultValue='outro'
                                                        treeData={deletionReasons}
                                                        placeholder="Selecione o motivo da desativação"
                                                        onChange={(e) => setDeletionReason(e)}
                                                    />
                                                </>
                                            ) : ('')
                                            }
                                        </Flex>
                                    </>
                                }
                            >
                                {userInfoData?.ativo ? (
                                    <Button danger type="primary" disabled={isLoadingModal} color={isLoadingModal ? "default" : "danger"} onClick={openPopConfirmDeletion}>
                                        Desativar
                                    </Button>
                                ) : (
                                    <Button disabled={isLoadingModal} type="primary" style={{ backgroundColor: 'rgb(135, 208, 104)' }} onClick={openPopConfirmDeletion}>
                                        Ativar
                                    </Button>
                                )
                                }

                            </Popconfirm>
                        </Space>
                    </>,
                    <Button disabled={isLoadingModal} key="back" onClick={() => onClose(false, false)}>
                        Cancelar
                    </Button>,
                    <Button type="primary" disabled={isLoadingModal} key="submit" onClick={handleUpdateUser}>
                        Salvar
                    </Button>
                ]}
            >

                <>
                    <Layout style={{ backgroundColor: 'transparent' }}>
                        <Form
                            disabled={isLoadingModal}
                            form={form}
                            layout="vertical"
                            name="edit-user-student"
                            style={formEditUserStudentStyle}
                        >
                            <Form.Item>
                                <Form.Item name="nome" label="Nome:" style={NO_MARGIN}>
                                    <Input type="text" />
                                </Form.Item>
                            </Form.Item>

                            <Form.Item>
                                <Form.Item name="sobrenome" label="Sobrenome:" style={NO_MARGIN}>
                                    <Input type="text" />
                                </Form.Item>
                            </Form.Item>

                            <Form.Item>
                                <Form.Item name="matricula" label="Matrícula:" style={NO_MARGIN}>
                                    <Input type="text" />
                                </Form.Item>
                            </Form.Item>

                            <Form.Item label="Pode postar" style={NO_MARGIN}>
                                <Form.Item name="pode_postar">
                                    <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                                </Form.Item>
                            </Form.Item>
                        </Form>
                    </Layout>
                </>
            </Modal >
        </>
    );
};