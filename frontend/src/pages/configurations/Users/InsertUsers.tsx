import { CheckCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, FileExcelOutlined, IssuesCloseOutlined, UserAddOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Form, Input, Layout, message, Modal, Radio, Tabs, Tag, Typography, Table, Drawer, List, Upload } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import type { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import type { TabsProps } from "antd/lib";
import React, { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import modeloPlanilha from "../../../assets/files/Modelo-planilha-criar-usuarios.xlsx";
import type { ColumnsType } from 'antd/es/table';
import { createUsers } from "../../../service/UsersService";
import type { ApiResponse } from "../../../types/ApiResponseType";
import { drawerResponseCreateUsersStyle } from "./Styles";
import type { NoticeType } from "antd/es/message/interface";

const { Text } = Typography;

interface IInsertUsers {
    isOpen: boolean,
    onClose: (successfull: boolean, shouldReload: boolean) => void
}

const options: CheckboxGroupProps<string>['options'] = [
    { label: 'Aluno', value: 'aluno', },
    { label: 'Professor', value: 'professor', },
    { label: 'Administrador', value: 'administrador', },
];

interface UserData {
    nome: string;
    sobrenome: string;
    matricula: string;
};

type TFailsAndSuccessfull = {
    falhas: string[],
    sucessos: string[]
}

type TResponseCreateUser = ApiResponse<{
    falhas: string[],
    sucessos: string[]
}>;

const PAGE_SIZE = 5;

export default function InsertUsers({ isOpen, onClose }: IInsertUsers) {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [parsedData, setParsedData] = useState<UserData[]>([]);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [openDrawerCreateUsersResponse, setOpenDrawerCreateUsersResponse] = useState<boolean>(false);
    const [createUsersResponseData, setCreateUsersResponseData] = useState<TFailsAndSuccessfull>();
    const [selectedTab, setSelectedTab] = useState<string>('1');

    const [visibleSucessos, setVisibleSucessos] = useState<string[]>([]);
    const [visibleFalhas, setVisibleFalhas] = useState<string[]>([]);
    const [loadingSucessos, setLoadingSucessos] = useState<boolean>(false);
    const [loadingFalhas, setLoadingFalhas] = useState<boolean>(false);

    const [showScrollDownButton, setShowScrollDownButton] = useState(false);
    const drawerScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        form.setFieldsValue({ 'tipo-usuario': 'aluno' });
    }, []);

    useEffect(() => {
        if (createUsersResponseData) {
            setVisibleSucessos(createUsersResponseData.sucessos.slice(0, PAGE_SIZE));
            setVisibleFalhas(createUsersResponseData.falhas.slice(0, PAGE_SIZE));
        }
    }, [createUsersResponseData]);

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
    }, [openDrawerCreateUsersResponse, visibleFalhas, visibleSucessos]);


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
                        nome: item['Nome completo'],
                        sobrenome: item['Sobrenome'],
                        matricula: item['Matrícula'].toString()
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
            showError("Por favor, envia apenas arquivos CSV ou XLSX.", 'error');
            return Upload.LIST_IGNORE;
        }

        try {
            const data = await readExcelFile(file);
            if (data.length > 0) {
                showError(`Planilha processada com sucesso! ${data.length} usuários encontrados.`, 'success');
                setParsedData(data);
            } else {
                showError("Nenhum dado encontrado na planilha.", 'warning');
            }
        } catch (error) {
            showError("Erro ao processar a planilha. Verifique o formato.", 'error');
        }

        return false;
    };

    const clearPreviewData = (showMessage: boolean, indexTab: string = '') => {
        setParsedData([]);

        if (indexTab != '') {
            setSelectedTab(indexTab);
        }

        if (showMessage) {
            showError("Pré-visualização limpa", 'info');
        }
    };

    const columns: ColumnsType<UserData> = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Sobrenome',
            dataIndex: 'sobrenome',
            key: 'sobrenome',
        },
        {
            title: 'Matrícula',
            dataIndex: 'matricula',
            key: 'matricula',
            width: 150,
        },
    ];

    const InsertMultipleUsersForm = () => {
        return (
            <>
                <Form
                    form={form}
                    disabled={isModalLoading}
                    initialValues={{
                        ['tipo-usuario']: 'aluno'
                    }}
                >
                    <Typography>
                        <Text>Tipo de usuários que deseja inserir:</Text>
                    </Typography>
                    <Form.Item name="tipo-usuario">
                        <Radio.Group
                            buttonStyle="solid"
                            block
                            options={options}
                            optionType="button"
                            disabled={isModalLoading}
                        >
                        </Radio.Group>
                    </Form.Item>
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
                            Insira o arquivo contendo o nome, sobrenome e matrícula dos usuários.
                        </p>
                        <p className="ant-upload-hint">
                            Tipos de arquivos aceitos: <Tag>CSV</Tag> e <Tag>XLSX</Tag>
                        </p>
                    </Dragger>
                )}
                <Divider />
                <Button type="link" icon={<DownloadOutlined />} href={modeloPlanilha} disabled={isModalLoading} download="Modelo-planilha-criar-usuarios.xlsx">Baixar modelo de planilha</Button>
            </>
        );
    }

    const InsertIndividualUserForm = (): React.ReactNode => {
        return (
            <>
                <Form
                    form={form}
                    disabled={isModalLoading}
                    initialValues={{
                        ['tipo-usuario']: 'aluno'
                    }}
                >
                    <Typography>
                        <Text>Tipo de usuários que deseja inserir:</Text>
                    </Typography>
                    <Form.Item name="tipo-usuario">
                        <Radio.Group
                            disabled={isModalLoading}
                            buttonStyle="solid"
                            options={options}
                            block
                            optionType="button"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Typography>
                        <Text>Primeiro nome:</Text>
                    </Typography>
                    <Form.Item
                        name="nome"
                        rules={[
                            { required: true, message: "Por favor, preencha o campo 'nome'" },
                            { min: 3, message: "O nome deve ter pelo menos 3 caracteres" },
                            { max: 255, message: "O nome deve ter no máximo 255 caracteres" }
                        ]}
                    >
                        <Input placeholder="Ex. João" disabled={isModalLoading} />
                    </Form.Item>

                    <Typography>
                        <Text>Sobrenome:</Text>
                    </Typography>
                    <Form.Item
                        name="sobrenome"
                        rules={[
                            { required: true, message: "Por favor, preencha o campo 'sobrenome'" },
                            { min: 3, message: "O sobrenome deve ter pelo menos 3 caracteres" },
                            { max: 255, message: "O sobrenome deve ter no máximo 255 caracteres" }
                        ]}
                    >
                        <Input placeholder="Ex. Silva Santos" disabled={isModalLoading} />
                    </Form.Item>
                    <Typography>
                        <Text>Matrícula:</Text>
                    </Typography>
                    <Form.Item
                        name="matricula"
                        rules={[
                            { required: true, message: "Por favor, preencha o campo 'matricula'" },
                            { max: 255, message: "A matrícula deve ter no máximo 255 caracteres" }
                        ]}
                    >
                        <Input placeholder="Ex. 123456789" disabled={isModalLoading} />
                    </Form.Item>
                </Form>
            </>
        );
    }

    const itemsTab: TabsProps['items'] = [
        {
            key: '1',
            label: "Inserir individualmente",
            icon: <UserAddOutlined />,
            children: <InsertIndividualUserForm />,
            disabled: isParsing || isModalLoading
        },
        {
            key: '2',
            animated: true,
            label: "Inserir multiplos",
            icon: <UsergroupAddOutlined />,
            children: <InsertMultipleUsersForm />,
            disabled: isParsing || isModalLoading
        }
    ];

    const showError = (message: string, type: NoticeType, duration: number = 2) => {
        messageApi.open({
            type: type,
            content: message,
            duration: duration
        });
    }

    const uploadUsers = async () => {

        let users: UserData[] = [];

        if (selectedTab === '1') {
            try {
                const values = await form.validateFields();
                const { nome, sobrenome, matricula } = values;
                users = [{ nome, sobrenome, matricula }];
            } catch (error) {
                showError(
                    'Por favor, preencha todos os campos obrigatórios corretamente.',
                    'error',
                );
                return;
            }
        } else {
            if (parsedData.length === 0) {
                showError(
                    'Nengum dado para enviar.',
                    'error'
                );
                return;
            }
            users = parsedData;
        }

        setIsModalLoading(true);
        const dataBody = {
            tipo_usuario: form.getFieldValue('tipo-usuario'),
            usuarios: users
        };

        createUsers(dataBody)
            .then((response: TResponseCreateUser) => {
                setCreateUsersResponseData({
                    sucessos: response.data.data.sucessos,
                    falhas: response.data.data.falhas
                });
                setOpenDrawerCreateUsersResponse(true);
                setIsModalLoading(false);
                setParsedData([]);

                if (selectedTab === '1') {
                    form.setFieldsValue({
                        nome: '',
                        sobrenome: '',
                        matricula: ''
                    });
                }
            })
            .catch(() => {
                showError('Erro ao criar usuario(s)', 'error');
                setIsModalLoading(false);
                setParsedData([]);
            });
    };

    const onLoadMoreSucessos = () => {
        setLoadingSucessos(true);
        const currentLength = visibleSucessos.length;
        const newChunk = createUsersResponseData!.sucessos.slice(
            currentLength,
            currentLength + PAGE_SIZE
        );
        setVisibleSucessos([...visibleSucessos, ...newChunk]);
        setLoadingSucessos(false);
    };

    const onLoadMoreFalhas = () => {
        setLoadingFalhas(true);
        const currentLength = visibleFalhas.length;
        const newChunk = createUsersResponseData!.falhas.slice(
            currentLength,
            currentLength + PAGE_SIZE
        );
        setVisibleFalhas([...visibleFalhas, ...newChunk]);
        setLoadingFalhas(false);
    };

    const loadMoreSucessos =
        !loadingSucessos && createUsersResponseData && visibleSucessos.length < createUsersResponseData.sucessos.length ? (
            <div style={{ textAlign: 'center', marginTop: 12, lineHeight: '32px' }}>
                <Button onClick={onLoadMoreSucessos}>Carregar mais</Button>
            </div>
        ) : null;

    const loadMoreFalhas =
        !loadingFalhas && createUsersResponseData && visibleFalhas.length < createUsersResponseData.falhas.length ? (
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
            onCancel={() => { !isModalLoading && onClose(true, false) }}
            title="Adicionar usuários"
            footer={[
                <Button key="cancel_modal_btn" onClick={() => onClose(true, false)} disabled={isParsing || isModalLoading}>Cancelar</Button>,
                <Button key="insert_modal_btn" type="primary" disabled={isModalLoading || isParsing} onClick={() => uploadUsers()}>Inserir</Button>
            ]}
        >
            {contextHolder}
            <Divider />
            <Flex vertical>
                <Tabs defaultActiveKey={selectedTab} items={itemsTab} size="small" animated={{ inkBar: true }} onChange={(index) => { clearPreviewData(false, index); }} />
            </Flex>

            {openDrawerCreateUsersResponse && (
                <Drawer
                    title="Resultado da Criação de Usuários"
                    placement="bottom"
                    closable={true}
                    onClose={() => setOpenDrawerCreateUsersResponse(false)}
                    open={openDrawerCreateUsersResponse}
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
                                <>
                                    <Text><Tag color="gold"><span style={{ color: 'red' }}>*</span><span style={{ color: 'black' }}>A senha dos usuarios criados serão suas respectivas matrículas. Elas precisarão ser alteradas no primeiro login do usuário, onde ele também terá que cadastrar um e-mail.</span></Tag></Text>
                                    <List
                                        header={<Text strong>Usuário(s) criados com sucesso:</Text>}
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
                                </>
                            )}

                            {visibleFalhas.length > 0 && (
                                <List
                                    header={<Text strong>Falha ao criar o(s) seguinte(s) usuário(s):</Text>}
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