import { CheckCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, FileExcelOutlined, IssuesCloseOutlined, UserSwitchOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Form, Input, Layout, message, Modal, Radio, Tabs, Tag, Typography, Table, Drawer, List, Select, Upload } from "antd";
import type { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import type { TabsProps } from "antd/lib";
import React, { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import modeloPlanilha from "../../../assets/files/Modelo-planilha-habilitar-desabilitar-usuarios.xlsx";
import type { ColumnsType } from 'antd/es/table';
import { disableUsers, reactivateUsers } from "../../../service/UsersService";
import type { ApiResponse } from "../../../types/ApiResponseType";
import { drawerResponseCreateUsersStyle } from "./Styles";
import type { NoticeType } from "antd/es/message/interface";

const { Text } = Typography;

interface IEnableDisableUsers {
    isOpen: boolean,
    onClose: (successful: boolean, shouldReload: boolean) => void
}

interface UserData {
    matricula: string;
}

type TFailsAndSuccessful = {
    falhas: string[],
    sucessos: string[]
}

type TResponseEnableDisableUser = ApiResponse<{
    falhas: string[],
    sucessos: string[]
}>;

const PAGE_SIZE = 5;

const reasonOptions = [
    { label: 'Professor saiu', value: 'professor_saiu' },
    { label: 'Aluno abandonou curso', value: 'aluno_abandonou_curso' },
    { label: 'Aluno concluiu curso', value: 'aluno_concluiu_curso' },
    { label: 'Aluno trancou curso', value: 'aluno_trancou_curso' },
];

export default function EnableDisableUsers({ isOpen, onClose }: IEnableDisableUsers) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [parsedData, setParsedData] = useState<UserData[]>([]);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [openDrawerResponse, setOpenDrawerResponse] = useState<boolean>(false);
    const [responseData, setResponseData] = useState<TFailsAndSuccessful>();
    const [selectedTab, setSelectedTab] = useState<string>('1');
    const [action, setAction] = useState<'disable' | 'enable'>('disable');

    const [visibleSucessos, setVisibleSucessos] = useState<string[]>([]);
    const [visibleFalhas, setVisibleFalhas] = useState<string[]>([]);
    const [loadingSucessos, setLoadingSucessos] = useState<boolean>(false);
    const [loadingFalhas, setLoadingFalhas] = useState<boolean>(false);

    const [showScrollDownButton, setShowScrollDownButton] = useState(false);
    const drawerScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        form.setFieldsValue({ 'acao': 'disable' });
    }, []);

    useEffect(() => {
        if (responseData) {
            setVisibleSucessos(responseData.sucessos.slice(0, PAGE_SIZE));
            setVisibleFalhas(responseData.falhas.slice(0, PAGE_SIZE));
        }
    }, [responseData]);

    useEffect(() => {
        const drawerBody = drawerScrollRef.current;

        const handleScroll = () => {
            if (!drawerBody) return;

            const { scrollTop, scrollHeight, clientHeight } = drawerBody;
            const hasScrollbar = scrollHeight > clientHeight;
            const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 50;

            setShowScrollDownButton(hasScrollbar && isFarFromBottom);
        };

        if (drawerBody) {
            handleScroll();
            drawerBody.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (drawerBody) {
                drawerBody.removeEventListener('scroll', handleScroll);
            }
        };
    }, [openDrawerResponse, visibleFalhas, visibleSucessos]);

    const readExcelFile = (file: RcFile): Promise<UserData[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    setIsParsing(true);
                    setIsModalLoading(true);
                    const data = e.target?.result;

                    const workbook = XLSX.read(data, { type: 'array' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                    const mappedData: UserData[] = jsonData.map((item) => ({
                        matricula: item['Matrícula']
                    }));

                    resolve(mappedData);
                } catch (error) {
                    reject(error);
                } finally {
                    setIsParsing(false);
                    setIsModalLoading(false);
                }
            };

            reader.onerror = (error) => reject(error);

            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileUpload = async (file: RcFile) => {
        const fileTypesAllowed = ['.csv', '.xlsx', 'xls'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!fileTypesAllowed.includes(fileExtension)) {
            showMessage("Por favor, envie apenas arquivos CSV ou XLSX.", 'error');
            return Upload.LIST_IGNORE;
        }

        try {
            const data = await readExcelFile(file);
            if (data.length > 0) {
                showMessage(`Planilha processada com sucesso! ${data.length} usuários encontrados.`, 'success');
                setParsedData(data);
            } else {
                showMessage("Nenhum dado encontrado na planilha.", 'warning');
            }
        } catch (error) {
            showMessage("Erro ao processar a planilha. Verifique o formato.", 'error');
        }

        return false;
    };

    const clearPreviewData = (showMsg: boolean, indexTab: string = '') => {
        setParsedData([]);

        if (indexTab !== '') {
            setSelectedTab(indexTab);
        }

        if (showMsg) {
            showMessage("Pré-visualização limpa", 'info');
        }
    };

    const columns: ColumnsType<UserData> = [
        {
            title: 'Matrícula do Usuário',
            dataIndex: 'matricula',
            key: 'matricula',
        },
    ];

    const MultipleUsersForm = () => {
        return (
            <>
                <Form form={form} disabled={isModalLoading}>
                    <Typography>
                        <Text>Ação a ser realizada:</Text>
                    </Typography>
                    <Form.Item name="acao" initialValue="disable">
                        <Radio.Group
                            buttonStyle="solid"
                            block
                            optionType="button"
                            disabled={isModalLoading}
                            onChange={(e) => setAction(e.target.value)}
                        >
                            <Radio.Button value="disable">Desabilitar</Radio.Button>
                            <Radio.Button value="enable">Habilitar</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    {action === 'disable' && (
                        <>
                            <Typography>
                                <Text>Motivo da desativação (opcional):</Text>
                            </Typography>
                            <Form.Item name="razao_da_desativacao">
                                <Select
                                    placeholder="Selecione um motivo"
                                    options={reasonOptions}
                                    disabled={isModalLoading}
                                    allowClear
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>

                {parsedData.length > 0 ? (
                    <Layout style={{ background: 'white', padding: '16px 0' }}>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                            <Typography>
                                <Text strong>Pré-visualização dos dados ({parsedData.length} usuários)</Text>
                            </Typography>
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => clearPreviewData(true)}
                                size="small"
                                danger
                                disabled={isModalLoading}
                            >
                                Limpar
                            </Button>
                        </Flex>

                        <Table
                            size="small"
                            columns={columns}
                            dataSource={parsedData.map((item, index) => ({ ...item, key: index }))}
                            pagination={{
                                pageSize: 5,
                                showSizeChanger: false,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} de ${total} usuários`
                            }}
                            scroll={{ y: 240 }}
                            style={{ marginBottom: 16 }}
                            loading={isModalLoading}
                        />
                    </Layout>
                ) : (
                    <Dragger
                        disabled={isParsing || isModalLoading}
                        accept=".csv, .xlsx, .xls"
                        beforeUpload={handleFileUpload}
                    >
                        <p className="ant-upload-drag-icon">
                            <FileExcelOutlined />
                        </p>
                        <p className="ant-upload-text">Clique ou arraste a planilha para esta área</p>
                        <p className="ant-upload-hint">
                            Insira o arquivo contendo as matríclas dos usuários.
                        </p>
                        <p className="ant-upload-hint">
                            Tipos de arquivos aceitos: <Tag>CSV</Tag><Tag>XLS</Tag><Tag>XLSX</Tag>
                        </p>
                    </Dragger>
                )}
                <Divider />
                <Button type="link" icon={<DownloadOutlined />} href={modeloPlanilha} disabled={isModalLoading} download="Modelo-planilha-habilitar-desabilitar-usuarios.xlsx">
                    Baixar modelo de planilha
                </Button>
            </>
        );
    };

    const IndividualUserForm = (): React.ReactNode => {
        return (
            <>
                <Form form={form} disabled={isModalLoading}>
                    <Typography>
                        <Text>Ação a ser realizada:</Text>
                    </Typography>
                    <Form.Item name="acao" initialValue="disable">
                        <Radio.Group
                            buttonStyle="solid"
                            block
                            optionType="button"
                            disabled={isModalLoading}
                            onChange={(e) => setAction(e.target.value)}
                        >
                            <Radio.Button value="disable">Desabilitar</Radio.Button>
                            <Radio.Button value="enable">Habilitar</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Typography>
                        <Text>Matrícula:</Text>
                    </Typography>
                    <Form.Item
                        name="matricula"
                        rules={[
                            { required: true, message: "Por favor, preencha a matrícula do usuário" },
                            { min: 3, message: "A matrícula deve ter pelo menos 3 caracteres" },
                            { max: 255, message: "A matrícula deve ter até 255 caracteres" },
                        ]}
                    >
                        <Input placeholder="Ex. 1234567890" disabled={isModalLoading} />
                    </Form.Item>

                    {action === 'disable' && (
                        <>
                            <Typography>
                                <Text>Motivo da desativação (opcional):</Text>
                            </Typography>
                            <Form.Item name="razao_da_desativacao">
                                <Select
                                    placeholder="Selecione um motivo"
                                    options={reasonOptions}
                                    disabled={isModalLoading}
                                    allowClear
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </>
        );
    };

    const itemsTab: TabsProps['items'] = [
        {
            key: '1',
            label: "Individual",
            icon: <UserSwitchOutlined />,
            children: <IndividualUserForm />,
            disabled: isParsing || isModalLoading
        },
        {
            key: '2',
            animated: true,
            label: "Múltiplos",
            icon: <UsergroupDeleteOutlined />,
            children: <MultipleUsersForm />,
            disabled: isParsing || isModalLoading
        }
    ];

    const showMessage = (msg: string, type: NoticeType, duration: number = 2) => {
        messageApi.open({
            type: type,
            content: msg,
            duration: duration
        });
    };

    const handleAction = async () => {
        let users: string[] = [];
        const reason = form.getFieldValue('razao_da_desativacao');

        if (selectedTab === '1') {
            try {
                const values = await form.validateFields();
                users = [values.matricula];
            } catch (error) {
                showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
        } else {
            if (parsedData.length === 0) {
                showMessage('Nenhum dado para enviar.', 'error');
                return;
            }
            users = parsedData.map(u => u.matricula);
        }

        setIsModalLoading(true);
        const dataBody = {
            usuarios: users,
            ...(action === 'disable' && reason && { razao_da_desativacao: reason })
        };
        const serviceCall = action === 'disable' ? disableUsers : reactivateUsers;

        serviceCall(dataBody)
            .then((response: TResponseEnableDisableUser) => {
                setResponseData({
                    sucessos: response.data.data.sucessos,
                    falhas: response.data.data.falhas
                });
                setOpenDrawerResponse(true);
                setIsModalLoading(false);
                setParsedData([]);

                if (selectedTab === '1') {
                    form.setFieldsValue({ matricula: '' });
                }
            })
            .catch(() => {
                showMessage(`Erro ao ${action === 'disable' ? 'desabilitar' : 'habilitar'} usuário(s)`, 'error');
                setIsModalLoading(false);
                setParsedData([]);
            });
    };

    const onLoadMoreSucessos = () => {
        setLoadingSucessos(true);
        const currentLength = visibleSucessos.length;
        const newChunk = responseData!.sucessos.slice(currentLength, currentLength + PAGE_SIZE);
        setVisibleSucessos([...visibleSucessos, ...newChunk]);
        setLoadingSucessos(false);
    };

    const onLoadMoreFalhas = () => {
        setLoadingFalhas(true);
        const currentLength = visibleFalhas.length;
        const newChunk = responseData!.falhas.slice(currentLength, currentLength + PAGE_SIZE);
        setVisibleFalhas([...visibleFalhas, ...newChunk]);
        setLoadingFalhas(false);
    };

    const loadMoreSucessos = !loadingSucessos && responseData && visibleSucessos.length < responseData.sucessos.length ? (
        <div style={{ textAlign: 'center', marginTop: 12, lineHeight: '32px' }}>
            <Button onClick={onLoadMoreSucessos}>Carregar mais</Button>
        </div>
    ) : null;

    const loadMoreFalhas = !loadingFalhas && responseData && visibleFalhas.length < responseData.falhas.length ? (
        <div style={{ textAlign: 'center', marginTop: 12, lineHeight: '32px' }}>
            <Button onClick={onLoadMoreFalhas}>Carregar mais</Button>
        </div>
    ) : null;

    const scrollToBottom = () => {
        drawerScrollRef.current?.scrollTo({
            top: drawerScrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <Modal
            open={isOpen}
            onCancel={() => { !isModalLoading && onClose(true, true) }}
            title="Habilitar/Desabilitar Usuários"
            footer={[
                <Button key="cancel_modal_btn" onClick={() => onClose(true, true)} disabled={isParsing || isModalLoading}>
                    Cancelar
                </Button>,
                <Button key="action_modal_btn" type="primary" disabled={isModalLoading || isParsing} onClick={handleAction}>
                    {action === 'disable' ? 'Desabilitar' : 'Habilitar'}
                </Button>
            ]}
        >
            {contextHolder}
            <Divider />
            <Flex vertical>
                <Tabs
                    defaultActiveKey={selectedTab}
                    items={itemsTab}
                    size="small"
                    animated={{ inkBar: true }}
                    onChange={(index) => { clearPreviewData(false, index); }}
                />
            </Flex>

            {openDrawerResponse && (
                <Drawer
                    title={`Resultado da ${action === 'disable' ? 'Desabilitação' : 'Habilitação'} de Usuários`}
                    placement="bottom"
                    closable={true}
                    onClose={() => setOpenDrawerResponse(false)}
                    open={openDrawerResponse}
                    style={drawerResponseCreateUsersStyle}
                    styles={{
                        body: {
                            maxHeight: 'calc(100vh - 120px)',
                            overflowY: 'auto',
                            paddingBottom: '50px'
                        }
                    }}
                >
                    <div ref={drawerScrollRef} style={{ height: '100%', overflowY: 'auto' }}>
                        <Flex vertical gap="large">
                            {visibleSucessos.length > 0 && (
                                <List
                                    header={<Text strong>Usuário(s) {action === 'disable' ? 'desabilitados' : 'habilitados'} com sucesso:</Text>}
                                    dataSource={visibleSucessos}
                                    loadMore={loadMoreSucessos}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />}
                                                title={item}
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}

                            {visibleFalhas.length > 0 && (
                                <List
                                    header={<Text strong>Falha ao {action === 'disable' ? 'desabilitar' : 'habilitar'} o(s) seguinte(s) usuário(s):</Text>}
                                    dataSource={visibleFalhas}
                                    loadMore={loadMoreFalhas}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<IssuesCloseOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />}
                                                title={item}
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Flex>
                    </div>
                    {showScrollDownButton && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}>
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<DownOutlined />}
                                onClick={scrollToBottom}
                                size="large"
                            />
                        </div>
                    )}
                </Drawer>
            )}
        </Modal>
    );
}