import { ClearOutlined, CloudDownloadOutlined, CopyOutlined, DragOutlined, EditOutlined, InfoCircleOutlined, LeftOutlined, LoadingOutlined, MoreOutlined, SearchOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Dropdown, Flex, Form, Grid, Input, Layout, message, Modal, QRCode, Select, Space, Spin, Tag, Tooltip, Typography, type SelectProps } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import { useNavigate, useParams } from "react-router"
import { clearFieldsButtonStyle, formItemStyle, formRowStyle, formStyle, labelStyle, materiaSelectStyle, searchBarStyle, teacherSelectStyle, UserInteractionButtonsStyle } from "./Style";
import mainIcon from '../../../assets/icons/logo.svg';
import Title from "antd/es/typography/Title";
import { getAllDocumentCollection, getDocumentsFromCollectionById, updateDocumentsOrder } from "../../../service/CollectionDocument";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { TAllSubjectsResponse, TSubject, TSubjectTypes } from "../../../types/Subjects";
import Paragraph from "antd/es/typography/Paragraph";
import { NoData } from "../../../components/NoData/NoData";
import type { TSimpleUser, UsersTeacherResponse } from "../../../types/UserType";
import { useDebounce } from "../../../hooks/UseDebouce";
import { getSubjects } from "../../../service/SubjectsService";
import CardSummary from "../../../components/CardSummary/CardSummary";
import { getAllTeachersSimple } from "../../../service/UsersService";
import { Doodle } from "../../../components/Doodle/Doodle";
import { editCollectionName, getCollectionById } from "../../../service/CollectionsService";
import { useAuth } from "../../../context/AuthContext";
import { shareSocialMedia } from "../../../utils/ShareSoccialMedia";
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface DraggableCardProps {
    summary: any;
    isDragging: boolean;
    isOwner: boolean;
}

export function Collection() {

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const { user } = useAuth();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [formEdit] = Form.useForm();
    const { debounce } = useDebounce();
    const queryClient = useQueryClient();
    const { collection_id, user_id } = useParams();
    const [messageApi, contextHolder] = message.useMessage();

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedType, setSelectedType] = useState<TSubjectTypes | '*'>('*');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [subjects, setSubjects] = useState<TSubject[]>();
    const [teachers, setTeachers] = useState<TSimpleUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [collectionData, setCollectionData] = useState<any>();
    const [loadingCollection, setLoadingCollection] = useState(false);
    const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState(false);

    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [localSummaries, setLocalSummaries] = useState<any[]>([]);

    const isOwner = user?.user_id === user_id;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const { data: summaryResponse, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['summariesCollection', debouncedSearchTerm, selectedTeacher, selectedType, selectedSubject],
        queryFn: async ({ pageParam = 1 }) => {
            if (collection_id) {
                const response = await getDocumentsFromCollectionById(
                    collection_id,
                    debouncedSearchTerm,
                    pageParam,
                    selectedSubject,
                    selectedType,
                    selectedTeacher
                );
                return response.data.data;
            } else {
                const response = await getAllDocumentCollection(
                    debouncedSearchTerm,
                    pageParam,
                    selectedSubject,
                    selectedType,
                    selectedTeacher,
                    user_id ? user_id : ''
                );
                return response.data.data
            }
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
        const summaries = summaryResponse?.pages.flatMap((page: any) => page.data) || [];
        setLocalSummaries(summaries);
    }, [summaryResponse]);

    useEffect(() => {
        debounce(() => {
            setDebouncedSearchTerm(searchTerm);
        });
    }, [searchTerm, selectedTeacher, debounce, selectedType, selectedSubject]);

    useEffect(() => {
        setIsLoading(true);
        queryClient.invalidateQueries({ queryKey: ['summariesCollection'] })
            .then(() => {
                loadSubjects();
                loadTeachers();

                if (collection_id) {
                    loadCollectionData();
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleDragStart = (event: DragEndEvent) => {
        setDraggedId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedId(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = localSummaries.findIndex(s => s.id === active.id);
        const newIndex = localSummaries.findIndex(s => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newSummaries = [...localSummaries];
        const [movedItem] = newSummaries.splice(oldIndex, 1);
        newSummaries.splice(newIndex, 0, movedItem);

        setLocalSummaries(newSummaries);

        const documentsOrder = newSummaries.map((summary, index) => ({
            documento_id: summary.id,
            ordem: index + 1
        }));

        try {
            await updateDocumentsOrder(collection_id || null, documentsOrder);
            showMessage('Ordem atualizada!', 'success');

            queryClient.invalidateQueries({ queryKey: ['summariesCollection'] });
        } catch (error) {
            showMessage('Erro ao atualizar ordem', 'error');
            setLocalSummaries(summaryResponse?.pages.flatMap((page: any) => page.data) || []);
        }
    };

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

    const copyShareCollectionLink = async () => {
        try {
            let shareLink = '';

            if (collection_id) {
                shareLink = `${window.location.origin}/profile/${user_id}/collection/${collection_id}`;
            } else {
                shareLink = `${window.location.origin}/profile/${user_id}/saved`;
            }

            await navigator.clipboard.writeText(shareLink);
            showMessage('Link copiado!', 'success');
        } catch (e) {
            showMessage('Falha ao copiar', 'error');
        }
    }

    function doDownload(url: string, fileName: string) {
        const a = document.createElement('a');
        a.download = fileName;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const downloadCanvasQRCode = () => {
        const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
        if (canvas) {
            const url = canvas.toDataURL();
            doDownload(url, 'QRCode.png');
        }
    };

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        return messageApi.open({
            content: msg,
            type: type,
            duration: duration,
        });
    }

    const handleComeback = () => {
        navigate('/profile/' + user_id);
    }

    const getShareItems = () => {
        let items = [
            {
                key: '1',
                label: (
                    <Button onClick={copyShareCollectionLink} style={UserInteractionButtonsStyle} icon={<CopyOutlined />} >Copiar link</Button>
                ),
            },
            {
                key: '2',
                label: (
                    <QRCode id="myqrcode" icon={mainIcon} value={`${window.location.origin}/profile/${user_id}/collection/${collection_id}`} />
                )
            },
            {
                key: '3',
                label: (
                    <Button type="text" onClick={downloadCanvasQRCode} icon={<CloudDownloadOutlined />}>Baixar QR code</Button>
                )
            },
            {
                key: '4',
                label: (
                    <Button type="text" onClick={() => shareSocialMedia(`${collectionData?.data?.nome || 'Uma coleção foi compartilhada com você'}`, '', `${window.location.href}`)} icon={<ShareAltOutlined />}>Compartilhar</Button>
                )
            }
        ];
        return items;
    }

    const getEditItems = () => {
        let items = [
            {
                key: '1',
                label: (
                    <Button onClick={openEditCollectionModal} style={UserInteractionButtonsStyle} icon={<EditOutlined />} >Editar nome</Button>
                ),
            }
        ];
        return items;
    }

    const openEditCollectionModal = () => setIsModalEditOpen(true);
    const closeEditCollectionModal = () => setIsModalEditOpen(false);

    const subjectsOptions: SelectProps['options'] = subjects?.map((s: TSubject) => ({
        label: <Paragraph style={{ fontSize: '13px' }}><Tag>{s.sigla}</Tag>{s.nome}</Paragraph>,
        value: s.id,
    }));

    const typeOptions: { value: 'p1' | 'p2' | 'p3' | 'pf' | 'outros' | '*', label: React.ReactNode }[] = [
        { label: (<Tag color="#3f31ff"><strong>Todos os tipos</strong></Tag>), value: '*' },
        { label: (<Tag color="#31ff64"><strong>P1</strong></Tag>), value: 'p1' },
        { label: (<Tag color="#1affec"><strong>P2</strong></Tag>), value: 'p2' },
        { label: (<Tag color="#ff29bf"><strong>P3</strong></Tag>), value: 'p3' },
        { label: (<Tag color="#ff4545"><strong>PF</strong></Tag>), value: 'pf' },
        { label: (<Tag color="#ff9924"><strong>Outro</strong></Tag>), value: 'outros' }
    ];

    const teacherOptions: SelectProps['options'] = teachers.map((t: TSimpleUser) => ({
        label: `${t.nome} ${t.sobrenome}`,
        value: t.id
    }));

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

    const hasActiveFilters = searchTerm || selectedSubject || selectedType !== '*' || selectedTeacher;

    const allSummaries = useMemo(() => {
        return summaryResponse?.pages.flatMap((page: any) => page.data) || [];
    }, [summaryResponse]);

    const loadMoreSummaries = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const loadCollectionData = () => {
        if (collection_id) {
            setLoadingCollection(true);
            getCollectionById(collection_id)
                .then((response) => {
                    setCollectionData(response.data);
                })
                .catch(() => {
                    showMessage("Falha ao carregar dados da coleção", "error");
                })
                .finally(() => {
                    setLoadingCollection(false);
                });
        }
    }

    const saveNewCollectionName = () => {
        setIsSaving(true);
        formEdit.validateFields()
            .then(() => {
                if (collection_id) {
                    editCollectionName(collection_id, formEdit.getFieldValue('collection-name'))
                        .then((response: any) => {
                            if (response.status == 200) {
                                collectionData.data.nome = formEdit.getFieldValue('collection-name');
                                formEdit.resetFields();
                                closeEditCollectionModal();
                            }
                        })
                        .catch(() => {
                            showMessage("Falha ao salvar coleção", "error");
                        });
                }
            })
            .catch((e) => {
                if (e.errorFields) {
                    showMessage('Por favor, corrija os campos destacados', 'warning');
                } else {
                    showMessage("Falha ao salvar", 'error');
                }
            })
            .finally(() => {
                setIsSaving(false);
            });
    }

    function DraggableCard({ summary, isDragging, isOwner }: DraggableCardProps) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({ id: summary.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            position: 'relative' as const,
        };

        return (
            <div ref={setNodeRef} style={style}>
                {isOwner && (
                    <Button
                        {...attributes}
                        {...listeners}
                        icon={<DragOutlined />}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 10,
                            cursor: 'grab',
                        }}
                        type="text"
                    />
                )}
                <CardSummary summaryData={summary} />
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <Flex>
                <Card style={{ margin: '2vh', height: '96vh', width: '100%', overflow: 'auto' }}>
                    <Button onClick={handleComeback} type="link" icon={<LeftOutlined />}>Voltar</Button>
                    <Divider />
                    <Flex style={{ justifyContent: 'space-between', gap: '15px' }}>
                        <Title level={isMobile ? 4 : 3}>{collection_id
                            ? (loadingCollection
                                ? "Carregando..."
                                : collectionData?.data?.nome || "Sem nome"
                            )
                            : "Todos os resumos salvos"
                        }</Title>
                        <Flex gap='2vh'>
                            <Tooltip title="Compartilhar coleção">
                                <Dropdown menu={{ items: getShareItems() }} trigger={['click']}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        <Space style={{ fontSize: '20px', color: 'black' }}>
                                            <ShareAltOutlined />
                                        </Space>
                                    </a>
                                </Dropdown>
                            </Tooltip>
                            {collection_id && user?.user_id == user_id && (
                                <Tooltip title="Editar coleção">
                                    <Dropdown menu={{ items: getEditItems() }} trigger={['click']}>
                                        <a onClick={(e) => e.preventDefault()}>
                                            <Space style={{ fontSize: '20px', color: 'black' }}>
                                                <MoreOutlined />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            )}
                        </Flex>
                    </Flex>
                    <Divider />
                    <Flex vertical justify="center">
                        <Form form={form} style={formStyle} layout="vertical">
                            <Form.Item
                                name="query"
                                style={{ ...formItemStyle(isMobile), ...searchBarStyle }}
                                label={<Text strong style={labelStyle}>Buscar resumo:</Text>}
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

                                <Form.Item
                                    name="tipo"
                                    initialValue="*"
                                    style={formItemStyle(isMobile)}
                                    label={<Text strong style={labelStyle}>Tipo:</Text>}
                                >
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

                                <Form.Item name="professor" initialValue="" style={{ ...formItemStyle(isMobile), ...teacherSelectStyle }}>
                                    <Text strong style={labelStyle}>Professor:</Text>
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

                                <Form.Item
                                    style={formItemStyle(isMobile)}
                                    label={<Text strong style={labelStyle}>Ações</Text>}
                                >
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
                        {isOwner && !hasActiveFilters && collection_id ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localSummaries.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {localSummaries.map((summary) => (
                                        <DraggableCard
                                            key={summary.id}
                                            summary={summary}
                                            isDragging={draggedId === summary.id}
                                            isOwner={isOwner}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <>
                                {allSummaries.map((summary: any) => (
                                    <div key={summary.id}>
                                        <CardSummary summaryData={summary} />
                                    </div>
                                ))}
                            </>
                        )}
                        <Divider />

                        {isFetching || isLoading && (
                            <Spin style={{ marginTop: '200px' }} tip="Buscando..." size="large"> </Spin>
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

                        {!hasNextPage && allSummaries.length > 0 && (
                            <Layout style={{ width: '100%', background: 'transparent' }}>
                                <Flex vertical align="center">
                                    <Typography>
                                        <Text style={{ fontWeight: 700, color: 'grey' }}>Parece que você chegou ao fim!</Text>
                                    </Typography>
                                    <Doodle customEyePosition="top" customMouthStyle="surprise" width={80} height={120} />
                                </Flex>
                            </Layout>
                        )}

                        {allSummaries.length == 0 && (
                            <Flex vertical align="center" gap="middle" style={{ marginTop: '40px' }}>
                                <Typography>
                                    <Text style={{ fontWeight: 700, color: 'grey' }}>
                                        {hasActiveFilters
                                            ? 'Nenhum resumo encontrado com esses filtros'
                                            : `${user?.user_id == user_id ? 'Você ' : 'Este usuário'} ainda não salvou nenhum resumo nesta coleção`}
                                    </Text>
                                </Typography>
                                <Doodle customEyePosition="center" customMouthStyle="sad" width={80} height={120} />
                            </Flex>
                        )}

                    </Flex>
                </Card>
            </Flex>

            <Modal
                open={isModalEditOpen}
                onCancel={closeEditCollectionModal}
                title={
                    <>
                        <Title level={isMobile ? 4 : 3} style={{ placeSelf: 'center' }}>Editar coleção</Title>
                        <Divider />
                    </>
                }
                footer={[
                    <Button key="cancel-edit-collection" onClick={closeEditCollectionModal} loading={isSaving}>Cancelar</Button>,
                    <Button key="save-edit-collection" onClick={saveNewCollectionName} type="primary" loading={isSaving}>Salvar</Button>
                ]}
            >
                <Form
                    form={formEdit}
                    name="form-edit-collection"
                    title="Editar coleção"
                    initialValues={{
                        ['collection-name']: collectionData?.data?.nome || "Sem nome",
                    }}
                >
                    <Typography>
                        <Text>Nome da coleção:</Text>
                    </Typography>
                    <Form.Item
                        name="collection-name"
                        rules={[
                            { required: true, message: 'Por favor, adicione um título.' },
                            { min: 3, message: 'O título deve ter pelo menos 3 caracteres.' },
                            { max: 255, message: 'O título deve ter pelo menos 3 caracteres.' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}