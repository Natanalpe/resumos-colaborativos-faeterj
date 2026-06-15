import { Button, Divider, Drawer, Flex, Modal, Table, Form, Select, message } from "antd";
import type { TUserPropsData } from "./EditModal"
import { createWarning, deleteWarning, getWarningsByUserId } from "../../../service/WarningsService";
import type { TWarnings, TWarningsActions } from "../../../types/WarningsType";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { modalWarningsStyle } from "./Styles";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import TextArea from "antd/es/input/TextArea";

interface IEditVisualizeModal {
    userData: TUserPropsData,
    isOpen: boolean,
    onClose: (successfull: boolean, shouldReload: boolean) => void,
    userVisualization: boolean
}

type PaginatedUserWarningsResponse = {
    current_page: number;
    data: TWarnings[],
    per_page: number;
    total: number;
    last_page: number;
};

type TWarningsTable = {
    key: string;
    nome: string;
    acao: string;
    created_at: string;
}

export const EditWarnings = ({ userData, isOpen, onClose, userVisualization = false }: IEditVisualizeModal) => {

    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [page, setPage] = useState<number>(1);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isLoadingDrawer, setIsLoadingDrawer] = useState<boolean>(false);
    const [isDeletingWarning, setIsDeletingWarning] = useState<boolean>(false);

    const getWarningText = (acao: TWarningsActions): string => {
        switch (acao) {
            case 'multiplas_tentativas_de_upload':
                return 'Multiplas requisições consecutivas';
            case 'upload_de_conteudo_sensivel':
                return 'Upload de conteúdo sensível';
            case 'upload_de_virus':
                return 'Upload de vírus';
            default:
                return 'Outro motivo';
        }
    }

    const columns: ColumnsType<TWarningsTable> = useMemo(() => {
        const basicColumns: ColumnsType<TWarningsTable> = [
            {
                key: 'nome',
                title: 'Aluno',
                dataIndex: 'nome',
            },
            {
                key: 'acao',
                title: 'Motivo',
                dataIndex: 'acao',
            },
            {
                key: 'created_at',
                title: 'Data',
                dataIndex: 'created_at',
            }
        ]

        if (!userVisualization) {
            basicColumns.push({
                key: 'delete',
                title: 'Ações',
                render: (record) => <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteWarning(record.key)}>Apagar</Button>
            });
        }

        return basicColumns;
    }, [userVisualization, isOpen]);


    const { data: warningsResponse, isFetching } = useQuery<PaginatedUserWarningsResponse>({
        queryKey: ['warnings', page, userData.id],
        queryFn: async () => {
            const response = await getWarningsByUserId(userData.id, page);
            return response.data.data
        },
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: isOpen
    });

    const tableData = useMemo(() => {
        return warningsResponse?.data.map(warning => ({
            key: warning.id.toString(),
            nome: warning.student.nome + ' ' + warning.student.sobrenome,
            acao: getWarningText(warning.acao),
            created_at: new Date(warning.created_at).toLocaleDateString(),
            descricao: warning.descricao
        })) || [];
    }, [warningsResponse]);

    const closeDrawer = () => {
        setIsDrawerOpen(false);
    }

    const handleOpenDrawer = () => {
        form.resetFields();
        setIsDrawerOpen(true);
    }

    const handleCreateWarning = async () => {
        setIsLoadingDrawer(true);

        try {
            const values = await form.validateFields();

            setIsLoadingDrawer(true);

            const formData = {
                ...values,
                user_id: userData.id
            };

            createWarning(formData)
                .then(() => {
                    messageApi.success({
                        content: 'Advertência criada com sucesso.',
                        duration: 2
                    });
                    setIsDrawerOpen(false);
                    form.resetFields();
                    queryClient.invalidateQueries({ queryKey: ['warnings'] });

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
                            content: 'Falha ao criar advertência.',
                            duration: 2
                        });
                    }
                })
                .finally(() => {
                    setIsLoadingDrawer(false);
                });

        } catch (error) {
            setIsLoadingDrawer(false);

            messageApi.warning({
                content: 'Por favor, preencha todos os campos corretamente.',
                duration: 2
            });
        }
    }

    const handleDeleteWarning = async (id: string) => {
        setIsDeletingWarning(true);
        deleteWarning(id)
            .then(() => {
                messageApi.success({
                    content: "Sucesso",
                    duration: 2
                })
                    .then(() => {
                        queryClient.invalidateQueries({ queryKey: ['warnings'] });
                        setIsDrawerOpen(false);
                        setIsDeletingWarning(false);
                    });
            })
            .catch(() => {
                setIsDeletingWarning(false);
                messageApi.error({
                    content: 'Falha ao apagar advertência',
                    duration: 2
                });
            });
    }

    return (
        <>
            {contextHolder}
            <Modal
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%'
                }}
                style={modalWarningsStyle}
                title={`Gerenciando advertências`}
                open={isOpen}
                onCancel={() => onClose(false, false)}
                loading={isFetching}
                footer={[
                    <Button
                        key='voltar'
                        disabled={isFetching}
                        color={isFetching ? "default" : "primary"}
                        onClick={() => onClose(false, false)}
                    >
                        Voltar
                    </Button>,
                ]}
            >
                {!userVisualization && (
                    <Flex vertical justify="center" align="end">
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenDrawer}>Adicionar advertência</Button>
                    </Flex>
                )}
                <Divider />
                <Table
                    loading={isDeletingWarning}
                    columns={columns}
                    dataSource={tableData}
                    pagination={{ current: page, pageSize: warningsResponse?.per_page || 10, total: warningsResponse?.total || 0, showSizeChanger: false, onChange: (newPage) => setPage(newPage), disabled: isFetching }}
                    rowKey="key"
                    scroll={{ x: true }}
                    expandable={{
                        expandedRowRender: (record) => {
                            const warning = warningsResponse?.data.find(w => w.id.toString() === record.key);
                            return <p style={{ margin: 0 }}>{warning?.descricao || 'Sem descrição'}</p>
                        }
                    }}
                />

                <Drawer
                    title="Adicionar advertência"
                    closable={{ 'aria-label': 'Close Button' }}
                    open={isDrawerOpen && isOpen}
                    onClose={closeDrawer}
                    footer={[
                        <Button disabled={isLoadingDrawer} icon={<SaveOutlined />} type="primary" onClick={handleCreateWarning}>Criar</Button>
                    ]}
                >
                    <Form
                        form={form}
                        disabled={isLoadingDrawer}
                        layout="vertical"
                        name="edit-user-warning"
                    >
                        <Form.Item
                            name="acao"
                            label="Motivo da advertência:"
                            rules={[{ required: true, message: 'Por favor, selecione um motivo' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Selecione o motivo"
                                options={[
                                    { value: 'upload_de_conteudo_sensivel', label: 'Upload de conteúdo sensível' },
                                    { value: 'outros', label: 'Outro motivo' }
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="descricao"
                            label="Descrição:"
                            rules={[{ max: 255, message: "Número máximo de caracteres excedido." }]}
                        >
                            <TextArea rows={6} showCount count={{ max: 255 }} />
                        </Form.Item>

                        <Form.Item name="user_id" initialValue={userData.id} hidden>
                            <input type="hidden" />
                        </Form.Item>
                    </Form>
                </Drawer>
            </Modal>
        </>
    );
}