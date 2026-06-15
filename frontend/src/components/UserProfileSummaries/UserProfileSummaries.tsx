import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { NoticeType } from "antd/es/message/interface";
import { Button, Card, Flex, Layout, message, Spin, Typography, Form, Input, Tooltip, Divider, Select, Tag, type SelectProps, Grid } from "antd";
import { getUserPosts } from "../../service/UsersService";
import { getSubjects } from "../../service/SubjectsService";
import { getAllTeachersSimple } from "../../service/UsersService";
import type { TSummaryProfile } from "../../types/SummaryTypes";
import type { TAllSubjectsResponse, TSubject, TSubjectTypes } from "../../types/Subjects";
import type { TSimpleUser, UsersTeacherResponse } from "../../types/UserType";
import CardSummary from "../CardSummary/CardSummary";
import { PlusOutlined, SearchOutlined, ClearOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Text from "antd/es/typography/Text";
import Paragraph from "antd/es/typography/Paragraph";
import { ViewSummary } from "../ViewSummary/ViewSummary";
import { useDebounce } from "../../hooks/UseDebouce";
import { NoData } from "../NoData/NoData";
import { clearFieldsButtonStyle, formItemStyle, formRowStyle, formStyle, materiaSelectStyle, searchBarStyle, teacherSelectStyle } from "./Style";
import { useAuth } from "../../context/AuthContext";
import { Doodle } from "../Doodle/Doodle";

const { useBreakpoint } = Grid;

interface PaginatedPostsResponse {
    current_page: number;
    data: TSummaryProfile[];
    per_page: number;
    total: number;
    last_page: number;
}

export function UserProfileSummaries() {

    const screens = useBreakpoint();
    const { debounce } = useDebounce();
    const [form] = Form.useForm();
    const { user } = useAuth();
    const isMobile = !screens.md;

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedType, setSelectedType] = useState<TSubjectTypes | '*'>('*');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const queryClient = useQueryClient();

    const [subjects, setSubjects] = useState<TSubject[]>();
    const [teachers, setTeachers] = useState<TSimpleUser[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);

    const { user_id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [summaryId, setSummaryId] = useState<string>();
    const [viewSummaryIdOpen, setViewSummaryIdOpen] = useState<boolean>(false);

    const [page, setPage] = useState<number>(1);
    const [allPosts, setAllPosts] = useState<TSummaryProfile[]>([]);

    useEffect(() => {
        debounce(() => {
            setDebouncedSearchTerm(searchTerm);
            if (page !== 1) {
                setPage(1);
                setAllPosts([]);
            }
        });
    }, [searchTerm, debounce]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
            setAllPosts([]);
        }
    }, [selectedSubject, selectedType, selectedTeacher]);

    useEffect(() => {
        if (!user_id) {
            navigate('/');
            return;
        }
        queryClient.invalidateQueries({ queryKey: ['userPosts'] })
        loadSubjects();
        loadTeachers();
    }, [user_id, navigate]);

    const loadSubjects = () => {
        setIsLoadingFilters(true);
        getSubjects()
            .then((response: TAllSubjectsResponse) => {
                const sortedSubjects = response.data.data.sort((a, b) => {
                    if (a.nome < b.nome) return -1;
                    if (a.nome > b.nome) return 1;
                    return 0;
                });
                const tempArray: TSubject[] = [{ id: '', nome: 'Todas', sigla: 'Todas' }, ...sortedSubjects];
                setSubjects(tempArray);
            })
            .finally(() => setIsLoadingFilters(false));
    };

    const loadTeachers = () => {
        setIsLoadingFilters(true);
        getAllTeachersSimple()
            .then((response: UsersTeacherResponse) => {
                const tempArray: TSimpleUser[] = [{ id: '', nome: 'Todos', sobrenome: '' }, ...response.data.data];
                setTeachers(tempArray);
            })
            .finally(() => setIsLoadingFilters(false));
    };

    const fetchUserPosts = async (userId: string, currentPage: number) => {
        try {
            const response = await getUserPosts(
                userId,
                currentPage,
                debouncedSearchTerm,
                selectedSubject,
                selectedType,
                selectedTeacher
            );
            return response.data.data;
        } catch (error) {
            showMessage('Falha ao carregar posts do usuário.', 'error');
            throw error;
        }
    };

    const { data: userPosts, isFetching } = useQuery<PaginatedPostsResponse>({
        queryKey: ['userPosts', user_id, page, debouncedSearchTerm, selectedSubject, selectedType, selectedTeacher],
        queryFn: () => fetchUserPosts(user_id!, page),
        enabled: !!user_id && !isLoadingFilters,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (userPosts?.data) {
            setAllPosts(prev => {
                if (page === 1) {
                    return userPosts.data;
                }

                const existingIds = new Set(prev.map(post => post.id));
                const newPosts = userPosts.data.filter(post => !existingIds.has(post.id));
                return [...prev, ...newPosts];
            });
        }
    }, [userPosts, page]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const summaryId = urlParams.get('summary');

        if (summaryId) {
            setSummaryId(summaryId);
            setViewSummaryIdOpen(true);
        }
    }, []);

    const closeViewSummary = () => setViewSummaryIdOpen(false);

    const showMessage = (
        msg: string,
        type: NoticeType,
        duration: number = 3,
        func?: () => void
    ) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        }).then(() => {
            if (func) {
                func();
            }
        });
    };

    const handleLoadMore = () => {
        if (userPosts && page < userPosts.last_page) {
            setPage(page + 1);
        }
    };

    const clearFields = () => {
        form.setFieldsValue({
            query: '',
            materia: '',
            tipo: '*',
            professor: '',
        });
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedType('*');
        setSelectedTeacher('');
        setPage(1);
        setAllPosts([]);
    };

    const subjectsOptions: SelectProps['options'] = subjects?.map((s: TSubject) => ({
        label: <Paragraph style={{ fontSize: '13px', margin: 0 }}><Tag>{s.sigla}</Tag>{s.nome}</Paragraph>,
        value: s.id,
    }));

    const teacherOptions: SelectProps['options'] = teachers.map((t: TSimpleUser) => ({
        label: `${t.nome} ${t.sobrenome}`,
        value: t.id
    }));

    const typeOptions: { value: 'p1' | 'p2' | 'p3' | 'pf' | 'outros' | '*', label: React.ReactNode }[] = [
        { label: (<Tag color="#3f31ff"><strong>Todos os tipos</strong></Tag>), value: '*' },
        { label: (<Tag color="#31ff64"><strong>P1</strong></Tag>), value: 'p1' },
        { label: (<Tag color="#1affec"><strong>P2</strong></Tag>), value: 'p2' },
        { label: (<Tag color="#ff29bf"><strong>P3</strong></Tag>), value: 'p3' },
        { label: (<Tag color="#ff4545"><strong>PF</strong></Tag>), value: 'pf' },
        { label: (<Tag color="#ff9924"><strong>Outro</strong></Tag>), value: 'outros' }
    ];

    const hasActiveFilters = searchTerm || selectedSubject || selectedType !== '*' || selectedTeacher;

    return (
        <>
            {contextHolder}
            <Flex vertical align="center" justify="center" gap='2vh'>
                <Card style={{ width: '100%', border: 'none' }}>
                    <Flex vertical justify="center" align="end">
                        <Form form={form} style={formStyle} layout="vertical">
                            <Form.Item
                                name="query"
                                style={{ ...formItemStyle(isMobile), ...searchBarStyle }}
                                label={<Text strong>Buscar resumo</Text>}
                            >
                                <Input
                                    disabled={isFetching}
                                    placeholder="Digite para buscar..."
                                    prefix={<SearchOutlined />}
                                    suffix={
                                        <Tooltip title="Pesquise por titulo ou conteúdo do resumo">
                                            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, .45)' }} />
                                        </Tooltip>
                                    }
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Item>

                            <div style={formRowStyle(isMobile)}>
                                <Form.Item
                                    name="materia"
                                    initialValue=""
                                    style={{ ...formItemStyle(isMobile), ...materiaSelectStyle }}
                                    label={<strong>Matéria</strong>}
                                >
                                    <Select
                                        disabled={isFetching}
                                        value={selectedSubject}
                                        showSearch
                                        placeholder="Selecione a matéria"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={subjectsOptions}
                                        onChange={(e) => setSelectedSubject(e)}
                                        notFoundContent={
                                            <NoData message="Não há matérias" />
                                        }
                                    />
                                </Form.Item>

                                <Form.Item name="tipo" initialValue="*" style={formItemStyle(isMobile)} label={<strong>Tipo</strong>}>
                                    <Select
                                        disabled={isFetching}
                                        value={selectedType}
                                        showSearch
                                        placeholder="Selecione o tipo"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={typeOptions}
                                        onChange={(e) => setSelectedType(e)}
                                    />
                                </Form.Item>

                                <Form.Item name="professor" initialValue="" style={{ ...formItemStyle(isMobile), ...teacherSelectStyle }} label={<strong>Professor</strong>}>
                                    <Select
                                        disabled={isFetching}
                                        value={selectedTeacher}
                                        showSearch
                                        placeholder="Selecione o professor"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={teacherOptions}
                                        onChange={(e) => setSelectedTeacher(e)}
                                        notFoundContent={
                                            <NoData message="Não há professores" />
                                        }
                                    />
                                </Form.Item>

                                <Form.Item style={formItemStyle(isMobile)} label={<strong>Ações</strong>}>
                                    <Tooltip title="Limpar todos os filtros">
                                        <Button
                                            disabled={isFetching}
                                            icon={<ClearOutlined />}
                                            onClick={clearFields}
                                            style={clearFieldsButtonStyle(isMobile)}
                                        />
                                    </Tooltip>
                                </Form.Item>
                            </div>
                        </Form>
                    </Flex>
                </Card>

                <Divider style={{ margin: '0' }} />

                <Flex wrap align="center" justify="center" gap='2vh' style={{ width: '100%' }}>
                    {isFetching && page === 1 ? (
                        <Spin size="large" tip="Buscando...">
                            <div style={{ width: '100%', minHeight: '200px' }} />
                        </Spin>
                    ) : allPosts.length === 0 ? (
                        <Flex vertical align="center" gap="middle" style={{ marginTop: '40px' }}>
                            <Typography>
                                <Text style={{ fontWeight: 700, color: 'black' }}>
                                    {hasActiveFilters
                                        ? 'Nenhum resumo encontrado com esses filtros'
                                        : `${user?.user_id == user_id ? 'Você ' : 'Este usuário'} ainda não postou nada`}
                                </Text>
                            </Typography>
                            <Doodle customEyePosition="center" customMouthStyle="sad" width={80} height={120} />
                        </Flex>
                    ) : (
                        allPosts.map((up) => (
                            <div key={up.id} style={{ width: '100%' }}>
                                <CardSummary
                                    summaryData={up}
                                />
                            </div>
                        ))
                    )}
                </Flex>

                {userPosts && userPosts.last_page > 1 && page < userPosts.last_page && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '16px',
                        gap: '16px',
                        alignItems: 'center'
                    }}>
                        <Button
                            type="primary"
                            loading={isFetching}
                            icon={<PlusOutlined />}
                            iconPosition="end"
                            onClick={handleLoadMore}
                        >
                            Ver mais
                        </Button>
                    </div>
                )}

                {userPosts && page === userPosts.last_page && page > 1 && allPosts.length > 0 && (
                    <Layout style={{ width: '100%', background: 'transparent', marginTop: '1.5vh' }}>
                        <Flex vertical align="center">
                            <Typography>
                                <Text style={{ fontWeight: 700, color: 'grey' }}>Parece que você chegou ao fim!</Text>
                            </Typography>
                            <Doodle customEyePosition="top" customMouthStyle="surprise" width={80} height={120} />
                        </Flex>
                    </Layout>
                )}

                {isFetching && page > 1 && (
                    <Spin size="default" />
                )}

                <ViewSummary
                    id={summaryId}
                    open={viewSummaryIdOpen}
                    onClose={closeViewSummary}
                    onlyDeletedContent={0}
                />
            </Flex>
        </>
    );
}