import Layout from "antd/es/layout/layout";
import { useEffect, useMemo, useState } from "react";
import Title from "antd/es/typography/Title";
import { ClearOutlined, EditOutlined, InfoCircleFilled, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { getAllSubjects, searchSubjects } from "../../../service/SubjectsService";
import { EditViewSubject, type TSubjectPropsData } from "./EditModal";
import { Button, Card, Divider, Flex, Form, Input, message, Pagination, Table, Tag, Tooltip, type TableProps } from "antd";
import type { TSubject, TSubjectsDashboard } from "../../../types/Subjects";
import { flexLayoutStyle, searchBarStyle, searchStyle, tableStyle } from "./Styles";
import { BLUE_LINEAR_GRADIENT } from "../../../Global/Styles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "../../../hooks/UseDebouce";

interface PaginatedSubjectsResponse {
    current_page: number;
    data: TSubject[];
    per_page: number;
    total: number;
    last_page: number;
}

export default function SubjectsDashboard() {

    const { debounce } = useDebounce();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [page, setPage] = useState<number>(1);
    const queryClient = useQueryClient();

    const [form] = Form.useForm();

    useEffect(() => {
        debounce(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        });
    }, [searchTerm, debounce]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const initialValueSubject: TSubjectPropsData = {
        id: '',
        nome: '',
        professores: [],
        sigla: ''
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [subjectData, setSubjectData] = useState<TSubjectPropsData>();

    const [messageApi, contextHolder] = message.useMessage();
    const tagColors = ['#ea583a', '#34aa65', '#30b5f7', '#635ff7', '#d066f6'];
    const tableColumns: TableProps<TSubjectsDashboard>['columns'] = [
        {
            title: 'Sigla',
            dataIndex: 'sigla',
            key: 'sigla',
            render: (_, record, index) => (
                <Tag color={tagColors[index % tagColors.length]}>
                    {record.sigla}
                </Tag>
            )
        },
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Professores',
            dataIndex: 'professores',
            key: 'professores',
            render: (professores: { id: string; nomeCompleto: string }[]) => (
                <div>
                    {professores?.map((professor, i) => (
                        <Tag key={i}>{professor.nomeCompleto}</Tag>
                    ))}
                </div>
            )
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="Editar">
                    <Button
                        onClick={() => openModal(record as any, false)}
                        type="link"
                        icon={<EditOutlined />}
                    />
                </Tooltip>
            )
        }
    ];

    const { data: subjectsResponse, isFetching } = useQuery<PaginatedSubjectsResponse>({
        queryKey: ['subjects', page, debouncedSearchTerm],
        queryFn: async () => {
            if (debouncedSearchTerm) {
                const response = await searchSubjects(debouncedSearchTerm, page);
                return response.data.data;
            } else {
                const response = await getAllSubjects(page);
                return response.data.data;
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const tableData = useMemo(() => {
        return subjectsResponse?.data.map(subject => ({
            id: subject.id,
            sigla: subject.sigla,
            nome: subject.nome,
            professores: subject.professores?.map(prof => ({
                id: prof.id,
                nomeCompleto: `${prof.nome} ${prof.sobrenome}`
            })) || [],
        })) || [];
    }, [subjectsResponse]);

    const openModal = (record: any, isEditModal: boolean) => {
        if (isEditModal) {
            setSubjectData(initialValueSubject);
            setIsModalAddOpen(true);
        } else {
            setSubjectData({
                id: record.id,
                nome: record.nome,
                sigla: record.sigla,
                professores: record.professores.map((p: any) => p.id)
            });
            setIsModalOpen(true);
        }
    };

    const closeModal = (wasSuccessful: boolean = true, shouldReload: boolean = true) => {
        if (isModalAddOpen) {
            setIsModalAddOpen(false);
        } else {
            if (!wasSuccessful) {
                messageApi.open({
                    type: 'error',
                    content: 'Falha ao salvar a matéria',
                    duration: 5
                });
            }
            setIsModalOpen(false);
            setSubjectData(undefined);
        }
        shouldReload && queryClient.invalidateQueries({ queryKey: ['subjects'] });
    };

    const clearFields = () => {
        setSearchTerm('');
        form.resetFields();
    }

    return (
        <>
            {contextHolder}
            <Layout>
                <Flex vertical style={flexLayoutStyle}>
                    <Card style={BLUE_LINEAR_GRADIENT}>
                        <Title level={1}>Painel de matérias</Title>
                    </Card>
                    <Layout>
                        <Card style={tableStyle}>
                            <Flex vertical justify="center" align="end">
                                <Button style={{ width: 'auto' }} type="primary" icon={<PlusOutlined />} disabled={isFetching || isModalAddOpen || isModalOpen} onClick={() => openModal(initialValueSubject, true)}>Adicionar matéria </Button>
                                <Divider />
                                <Form form={form} style={searchStyle}>
                                    <Form.Item name="query" style={searchBarStyle}>
                                        <Input placeholder="Buscar matéria"
                                            prefix={<SearchOutlined />}
                                            suffix={
                                                <Tooltip title="É possível pesquisar por sigla, nome da matéria e nome do professor.">
                                                    <InfoCircleFilled style={{ color: 'rgba(0,0,0,.45)' }} />
                                                </Tooltip>
                                            }
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Button icon={<ClearOutlined />} onClick={clearFields}></Button>
                                </Form>
                            </Flex>
                            <div >
                                <Table
                                    loading={isFetching}
                                    columns={tableColumns}
                                    dataSource={tableData}
                                    pagination={false}
                                    rowKey="id"
                                />
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
                                    pageSize={subjectsResponse?.per_page || 10}
                                    total={subjectsResponse?.total || 0}
                                    showSizeChanger={false}
                                    onChange={(newPage) => setPage(newPage)}
                                    disabled={isFetching}
                                    simple={windowWidth < 576}
                                    showLessItems={windowWidth < 768}
                                />
                            </div>
                        </Card>

                        {isModalOpen && (
                            <EditViewSubject
                                isEditing={true}
                                subjectData={subjectData}
                                isOpen={isModalOpen}
                                onClose={closeModal}
                            />
                        )}
                        {isModalAddOpen && (
                            <EditViewSubject
                                isEditing={false}
                                subjectData={subjectData}
                                isOpen={isModalAddOpen}
                                onClose={closeModal}
                            />
                        )}
                    </Layout>
                </Flex>
            </Layout>
        </>
    );
}