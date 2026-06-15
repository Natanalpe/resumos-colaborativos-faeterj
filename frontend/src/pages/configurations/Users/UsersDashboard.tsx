import Layout from "antd/es/layout/layout";
import { CheckCircleOutlined, ClearOutlined, DownOutlined, EditOutlined, ExclamationCircleOutlined, InfoCircleFilled, PlusOutlined, SearchOutlined, SwapOutlined, WarningOutlined } from "@ant-design/icons";
import { type TableProps, Tooltip, Button, Flex, Card, Table, Divider, Form, Input, Select, Tag, Pagination, Checkbox, Dropdown, Space, Grid, Typography } from "antd";
import type { TUser, TUserDashboard } from "../../../types/UserType";
import Title from "antd/es/typography/Title";
import { dropDownFilterStyle, flexLayoutStyle, formRowStyle, roleSelectStyle, searchBarStyle, searchStyle, tableStyle } from "./Styles";
import { BLUE_LINEAR_GRADIENT } from "../../../Global/Styles";
import { useEffect, useMemo, useState } from "react";
import type { TRoles } from "../../../types/Roles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "../../../hooks/UseDebouce";
import { getAllUsers, searchUsers } from "../../../service/UsersService";
import { EditViewUser, type TUserPropsData } from "./EditModal";
import { EditWarnings } from "./EditWarning";
import InsertUsers from "./InsertUsers";
import EnableDisableUsers from "./EnableDisableUsers";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface PaginatedUsersResponse {
    current_page: number;
    data: TUser[];
    per_page: number;
    total: number;
    last_page: number;
}

export default function UsersDashboard() {

    const [form] = Form.useForm();
    const { debounce } = useDebounce();
    const queryClient = useQueryClient();
    const screens = useBreakpoint();
    const isMobile = !screens.lg;

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState('todos');
    const [activeOnly, setActiveOnly] = useState(true);
    const [canPostOnly, setCanPostOnly] = useState(true);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [page, setPage] = useState<number>(1);

    const [userData, setUserData] = useState<TUserPropsData>({ id: '' });
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [isModalWarningsOpen, setIsModalWarningsOpen] = useState(false);
    const [isModalEnableDisableOpen, setIsModalEnableDisableOpen] = useState(false);

    const tableColumns: TableProps<TUserDashboard>['columns'] = [
        { title: 'Nome', dataIndex: 'nome', key: 'nome' },
        { title: 'Tipo', dataIndex: 'role', key: 'role', render: (e) => <>{e == 'professor' ? <Tag color="#108ee9">Professor</Tag> : e == 'administrador' ? <Tag color="#eb5656">Administrador</Tag> : <Tag color="#b86ded">Aluno</Tag>}</> },
        { title: 'Status', dataIndex: 'ativo', key: 'isActive', render: (e) => <>{e == true ? <Tag color="#87d068">Ativo</Tag> : <Tag color="#f50">Desativado</Tag>}</> },
        { title: 'Pode postar', dataIndex: 'pode_postar', key: 'canPost', render: (e) => <>{e == true ? <CheckCircleOutlined style={{ color: 'green', fontSize: '1.5rem' }} /> : <ExclamationCircleOutlined style={{ color: 'red', fontSize: '1.5rem' }} />}</> },
        {
            title: 'Editar', key: 'actions', render: (record) =>
                <Flex style={{ gap: '8px' }}>
                    <Tooltip title="Editar">
                        <Button type="link" onClick={() => openEditUserModal(record)} icon={<EditOutlined />}></Button>
                    </Tooltip>
                    {record.role == 'aluno' && (
                        <Tooltip title="Advertências">
                            <Button type="link" onClick={() => openWarningUserModal(record)} icon={<WarningOutlined />}></Button>
                        </Tooltip>
                    )}
                </Flex>
        },
    ];

    const optionsRoleValues: { value: Omit<TRoles, 'administrador'>, label: string }[] = [
        { value: 'todos', label: 'Todos' },
        { value: 'aluno', label: 'Aluno' },
        { value: 'professor', label: 'Professor' },
        { value: 'administrador', label: 'Administrador' },
    ];

    useEffect(() => {
        debounce(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        });
    }, [searchTerm, selectedRole, debounce, activeOnly, canPostOnly]);

    const { data: usersResponse, isFetching } = useQuery<PaginatedUsersResponse>({
        queryKey: ['users', page, debouncedSearchTerm, selectedRole, activeOnly, canPostOnly],
        queryFn: async () => {
            if (debouncedSearchTerm || selectedRole) {
                const response = await searchUsers(debouncedSearchTerm, page, selectedRole, canPostOnly, activeOnly);
                return response.data.data;
            }
            const response = await getAllUsers(page);
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const tableData = useMemo(() => {
        return usersResponse?.data.map(user => ({
            id: user.id,
            nome: `${user.nome} ${user.sobrenome}`,
            role: user.role,
            ativo: user.ativo ?? false,
            pode_postar: user.pode_postar ?? false,
        })) || [];
    }, [usersResponse]);

    const clearFields = () => {
        form.setFieldsValue({
            query: '',
            tipo: 'todos'
        });
        setSearchTerm('');
        setSelectedRole('todos');
        setActiveOnly(true);
        setCanPostOnly(true);
    }

    const openEditUserModal = (record: any) => {
        setUserData(record);
        setIsModalEditOpen(true);
    }

    const openWarningUserModal = (record: any) => {
        setUserData(record);
        setIsModalWarningsOpen(true);
    }

    const closeModal = (success: boolean, shouldReloadUsers: boolean = false) => {
        if (success && shouldReloadUsers) {
            if (success) {
                queryClient.invalidateQueries({ queryKey: ['users'] });
            }
        }
        setIsModalAddOpen(false);
        setIsModalEditOpen(false);
        setIsModalWarningsOpen(false);
    }

    const dropdownContent = (
        <div style={dropDownFilterStyle}>
            <div
                style={{ padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setActiveOnly(!activeOnly)}
            >
                <Checkbox checked={activeOnly}>
                    Apenas usuários {activeOnly ? 'ativos' : 'desativados'}
                </Checkbox>
            </div>
            <div
                style={{ padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setCanPostOnly(!canPostOnly)}
            >
                <Checkbox checked={canPostOnly}>
                    Apenas quem {!canPostOnly && 'não'} pode postar
                </Checkbox>
            </div>
        </div>
    );

    return (
        <Layout>
            <Flex vertical style={flexLayoutStyle}>
                <Card style={BLUE_LINEAR_GRADIENT}>
                    <Title level={1}>Painel de usuários</Title>
                </Card>
                <Layout>
                    <Card style={tableStyle}>
                        <Flex vertical justify="center" align="end">
                            <Flex gap="2vh" wrap>
                                <Button style={{ width: 'auto' }} type="primary" icon={<SwapOutlined />} onClick={() => setIsModalEnableDisableOpen(true)}>Habilitar/Desabilitar usuário(s)</Button>
                                <Button style={{ width: 'auto' }} type="primary" icon={<PlusOutlined />} onClick={() => setIsModalAddOpen(true)}>Adicionar usuario(s)</Button>
                            </Flex>
                            <Divider />
                            <Form form={form} style={searchStyle} layout="vertical">
                                <Form.Item name="query" style={searchBarStyle} label={<Text strong>Buscar:</Text>}>
                                    <Input
                                        placeholder="Buscar usuário"
                                        prefix={<SearchOutlined />}
                                        suffix={
                                            <Tooltip title="Pesquise por nome, sobrenome ou matricula do usuário">
                                                <InfoCircleFilled style={{ color: 'rgba(0,0,0,.45)' }} />
                                            </Tooltip>
                                        }
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </Form.Item>

                                <div style={formRowStyle(isMobile)}>
                                    <Form.Item style={roleSelectStyle} name="tipo" initialValue="todos" label={<Text strong>Role:</Text>}>
                                        <Select
                                            showSearch
                                            placeholder="Tipo de usuário"
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={optionsRoleValues}
                                            value={selectedRole}
                                            onChange={(e) => { setSelectedRole(e) }}
                                        >
                                        </Select>
                                    </Form.Item>

                                    <Flex vertical gap={'8px'}>
                                        <Text strong>Outros filtros:</Text>
                                        <Dropdown
                                            popupRender={() => dropdownContent}
                                            trigger={['click']}
                                            onOpenChange={(open) => {
                                                if (!open) return;
                                            }}
                                        >
                                            <Button>
                                                <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    Outros filtros
                                                    <DownOutlined />
                                                </Space>
                                            </Button>
                                        </Dropdown>
                                    </Flex>

                                    <Flex vertical gap={'8px'}>
                                        <Text strong>Limpar</Text>
                                        <Tooltip title="Limpar filtros">
                                            <Button icon={<ClearOutlined />} onClick={clearFields}></Button>
                                        </Tooltip>
                                    </Flex>
                                </div>
                            </Form>
                        </Flex>
                        <div>
                            <Table
                                loading={isFetching}
                                columns={tableColumns}
                                dataSource={tableData}
                                pagination={false}
                                rowKey="id"
                            >
                            </Table>
                        </div>

                        <div style={{
                            width: '100%',
                            padding: '16px',
                            borderTop: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 'auto'
                        }}>
                            <Pagination
                                current={page}
                                pageSize={usersResponse?.per_page || 10}
                                total={usersResponse?.total || 0}
                                showSizeChanger={false}
                                onChange={(newPage) => setPage(newPage)}
                                disabled={isFetching}
                            />
                        </div>
                    </Card>

                    {isModalEditOpen && (
                        <EditViewUser
                            userData={userData}
                            isOpen={isModalEditOpen}
                            onClose={(success, reload) => {
                                closeModal(success, reload);
                            }}
                        />
                    )}

                    {isModalWarningsOpen && (
                        <EditWarnings
                            userData={userData}
                            isOpen={isModalWarningsOpen}
                            onClose={(success, reload) => {
                                closeModal(success, reload)
                            }}
                            userVisualization={false}
                        />
                    )}

                    {isModalAddOpen && (
                        <InsertUsers
                            isOpen={isModalAddOpen}
                            onClose={closeModal}
                        />
                    )}

                    {isModalEnableDisableOpen && (
                        <EnableDisableUsers
                            isOpen={isModalEnableDisableOpen}
                            onClose={(success, reload) => {
                                setIsModalEnableDisableOpen(false);
                                if (success && reload) {
                                    queryClient.invalidateQueries({ queryKey: ['users'] });
                                }
                            }}
                        />
                    )}
                </Layout>
            </Flex>
        </Layout>
    );
}