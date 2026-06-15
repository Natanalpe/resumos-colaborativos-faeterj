import { Button, Card, Divider, Flex, Form, Grid, Input, Layout, Select, Spin, Tag, Tooltip, Typography, type SelectProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getDeletedSummaries } from "../../service/SummariesService";
import type { TAllSubjectsResponse, TSubject, TSubjectTypes } from "../../types/Subjects";
import type { TSimpleUser, UsersTeacherResponse } from "../../types/UserType";
import { useDebounce } from "../../hooks/UseDebouce";
import { getAllTeachersSimple } from "../../service/UsersService";
import { getSubjects } from "../../service/SubjectsService";
import Paragraph from "antd/es/typography/Paragraph";
import { useInfiniteQuery } from "@tanstack/react-query";
import { tableStyle } from "../UserProfileSummaries/Style";
import { ClearOutlined, InfoCircleOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { NoData } from "../NoData/NoData";
import CardSummary from "../CardSummary/CardSummary";
import { useAuth } from "../../context/AuthContext";
import { clearFieldsButtonStyle, formItemStyle, formRowStyle, formStyle, labelStyle, materiaSelectStyle, searchBarStyle, teacherSelectStyle } from "./Styles";
import UploadSummary from "../Upload/UploadSummary";
import { ViewSummary } from "../ViewSummary/ViewSummary";
import { Doodle } from "../Doodle/Doodle";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function DeletedSummaries() {

    const [form] = Form.useForm();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedType, setSelectedType] = useState<TSubjectTypes | '*'>('*');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [subjects, setSubjects] = useState<TSubject[]>();
    const [teachers, setTeachers] = useState<TSimpleUser[]>([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

    const [summaryId, setSummaryId] = useState<string>();
    const [viewSummaryIdOpen, setViewSummaryIdOpen] = useState<boolean>(false);
    const { debounce } = useDebounce();

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const openCreateModal = () => {
        setCreateModalIsOpen(true);
    }

    const closeUploadModal = () => {
        setCreateModalIsOpen(false);
    }

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
    }

    useEffect(() => {
        debounce(() => {
            setDebouncedSearchTerm(searchTerm);
        });
    }, [searchTerm, selectedTeacher, debounce, selectedType, selectedSubject]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        const summaryId = urlParams.get('summary');

        if (summaryId) {
            setSummaryId(summaryId);
            setViewSummaryIdOpen(true)
        }
    }, []);

    const closeViewSummary = () => setViewSummaryIdOpen(false);

    const {
        data: summaryResponse,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['deletedsumarries', debouncedSearchTerm, selectedTeacher, selectedType, selectedSubject],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getDeletedSummaries(
                debouncedSearchTerm,
                pageParam,
                selectedSubject,
                selectedType,
                selectedTeacher
            );
            return response.data.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        loadSubjects();
        loadTeachers();
    }, []);

    const loadSubjects = () => {
        setIsLoading(true);

        getSubjects()
            .then((response: TAllSubjectsResponse) => {
                const sortedSubjects = response.data.data.sort((a, b) => {
                    if (a.nome < b.nome) return -1;
                    if (a.nome > b.nome) return 1;
                    return 0;
                })
                const tempArray: TSubject[] = [{ id: '', nome: 'Todas', sigla: 'Todas' }, ...sortedSubjects];
                setSubjects(tempArray);
                setIsLoading(false);
            });
    }

    const loadTeachers = () => {
        setIsLoading(true);

        getAllTeachersSimple()
            .then((response: UsersTeacherResponse) => {
                const tempArray: TSimpleUser[] = [{ id: '', nome: 'Todos', sobrenome: '' }, ...response.data.data];
                setTeachers(tempArray);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const subjectsOptions: SelectProps['options'] = subjects?.map((s: TSubject) => ({
        label: <Paragraph style={{ fontSize: '13px' }}><Tag>{s.sigla}</Tag>{s.nome}</Paragraph>,
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

    const loadMoreSummaries = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const allDelSummaries = useMemo(() => {
        return summaryResponse?.pages.flatMap((page: any) => page.data) || [];
    }, [summaryResponse]);

    return (
        <>
            <Layout style={{ flex: 1, overflow: 'hidden' }}>
                <Card style={tableStyle}>
                    <Flex vertical justify="center" align="end">
                        <Form form={form} style={formStyle} layout="vertical">
                            <Form.Item name="query" style={{ ...formItemStyle, ...searchBarStyle }}>
                                <Text strong style={labelStyle}>Buscar resumo:</Text>
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
                                    style={{ ...formItemStyle, ...materiaSelectStyle }}
                                    label={<Text strong style={labelStyle}>Matéria:</Text>}
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

                                <Form.Item name="tipo" initialValue="*" style={formItemStyle(isMobile)} label={<Text strong style={labelStyle}>Tipo:</Text>}>
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

                                <Form.Item name="professor" initialValue="" style={{ ...formItemStyle, ...teacherSelectStyle }} label={<Text strong style={labelStyle}>Professor:</Text>}>
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

                                <Form.Item style={formItemStyle(isMobile)} label={<Text strong style={labelStyle}>Ações</Text>}>
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
                    {allDelSummaries.map((summary: any) => (
                        <>
                            <CardSummary
                                key={summary.id}
                                summaryData={summary}
                                onlyDeletedContent={1}
                            />
                        </>
                    ))}
                    <Divider />

                    {isFetching || isLoading && (
                        <Spin style={{ marginTop: '200px' }} tip="Buscando..." size="large"> </Spin>
                    )}

                    {allDelSummaries.length === 0 && !isFetching && (
                        <>
                            <NoData message="Não há resumos" textSize="20px" imageSize="150px" customStyle={{ marginTop: '150px' }} />
                            <Flex style={{ gap: '2vh', marginTop: '3vh' }} justify="center">
                                {(user?.role === 'aluno' || user?.role === 'professor') && (
                                    <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />} iconPosition="end">Criar um</Button>
                                )}
                            </Flex>
                        </>
                    )}

                    {hasNextPage && (
                        <Flex justify="center" style={{ marginTop: '20px' }}>
                            <Button
                                type="primary"
                                onClick={loadMoreSummaries}
                                disabled={isFetchingNextPage}
                            >
                                Ver mais {isFetchingNextPage && <LoadingOutlined spin />}
                            </Button>
                        </Flex>
                    )}

                    {!hasNextPage && allDelSummaries.length > 0 && (
                        <Layout style={{ width: '100%', background: 'transparent' }}>
                            <Flex vertical align="center">
                                <Typography>
                                    <Text style={{ fontWeight: 700, color: 'grey' }}>Parece que você chegou ao fim!</Text>
                                </Typography>
                                <Doodle customEyePosition="top" customMouthStyle="surprise" width={80} height={120} />
                            </Flex>
                        </Layout>
                    )}
                </Card>
            </Layout>
            <UploadSummary
                isOpen={createModalIsOpen}
                onClose={closeUploadModal}
            />
            <ViewSummary
                id={summaryId}
                open={viewSummaryIdOpen}
                onClose={closeViewSummary}
                onlyDeletedContent={1}
            />

        </>
    );
}