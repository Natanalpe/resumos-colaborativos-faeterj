import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Col, Divider, Flex, message, Popconfirm, Row, Spin, Tag, Tooltip, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { deleteCollection, getUserCollections } from "../../service/CollectionsService";
import type { NoticeType } from "antd/es/message/interface";
import { Doodle } from "../Doodle/Doodle";
import { CreateCollection } from "../CreateCollection/CreateCollection";
import { useAuth } from "../../context/AuthContext";

const { Text } = Typography;

interface TCollection {
    id: string;
    nome: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    count_documentos: number;
}

interface PaginatedCollectionsResponse {
    current_page: number;
    data: TCollection[];
    per_page: number;
    total: number;
    last_page: number;
}

export function ProfileBookMarks() {
    const { user_id } = useParams();
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const [page, setPage] = useState<number>(1);
    const [allCollections, setAllCollections] = useState<TCollection[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchUserCollections = async (userId: string, currentPage: number) => {
        try {
            const response = await getUserCollections(userId, currentPage);
            return response.data.data;
        } catch (error) {
            showMessage('Falha ao carregar coleções do usuário.', 'error');
            throw error;
        }
    };

    const { data: userCollections, isFetching, refetch } = useQuery<PaginatedCollectionsResponse>({
        queryKey: ['userCollections', user_id, page],
        queryFn: () => fetchUserCollections(user_id!, page),
        enabled: !!user_id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (userCollections?.data) {
            setAllCollections(prev => {
                if (page === 1) {
                    return userCollections.data;
                }

                const existingIds = new Set(prev.map(collection => collection.id));
                const newCollections = userCollections.data.filter(
                    collection => !existingIds.has(collection.id)
                );
                return [...prev, ...newCollections];
            });
        }
    }, [userCollections, page]);

    const showMessage = (
        msg: string,
        type: NoticeType,
        duration: number = 3
    ) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        });
    };

    const handleLoadMore = () => {
        if (userCollections && page < userCollections.last_page) {
            setPage(page + 1);
        }
    };

    const openCreateModal = () => setIsCreateModalOpen(true);

    const closeCreateModal = (shouldReload: boolean) => {
        setIsCreateModalOpen(false);
        if (shouldReload) {
            reloadCollections();
        }
    };

    const reloadCollections = () => {
        setPage(1);
        setAllCollections([]);
        refetch();
    }

    const isOwner = user?.user_id === user_id;

    const allSavedCard = (
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Card
                key="all-saved"
                hoverable
                style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid #1890ff'
                }}
            >
                <Flex vertical gap="small">
                    <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: '16px' }}>
                            Todos os itens salvos
                        </Text>
                        <Tag color="blue">Geral</Tag>
                    </Flex>

                    <Divider style={{ margin: '8px 0' }} />

                    <Flex vertical gap="4px">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Todos os resumos salvos
                        </Text>
                    </Flex>

                    <Flex gap="small" style={{ marginTop: '8px' }}>
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0 }}
                            onClick={() => navigate(`/profile/${user_id}/saved`)}
                        >
                            Ver resumos
                        </Button>
                    </Flex>
                </Flex>
            </Card>
        </Col>

    );

    const handleDeleteCollection = (colection_id: string) => {
        setDeleting(true);

        deleteCollection(colection_id)
            .then(() => {
                showMessage("Coleção apagada", "success");
                reloadCollections();
            })
            .catch(() => {
                showMessage("Falha ao apagar coleção", "error");
            })
            .finally(() => {
                setDeleting(false);
            })
    }

    return (
        <>
            {contextHolder}
            <Flex vertical align="center" justify="center" style={{ padding: '2vh' }} gap='2vh' wrap>
                {isOwner && (
                    <>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                            style={{ alignSelf: 'end' }}
                        >
                            Nova Coleção
                        </Button>
                        <Divider size="small" />
                    </>

                )}

                <Row gutter={[16, 16]} justify="center" style={{ width: '100%' }}>
                    {isFetching && page === 1 ? (
                        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Spin size="large" tip="Buscando coleções..." />
                        </Col>
                    ) : allCollections.length === 0 ? (
                        <Col span={24}>
                            <Flex vertical align="center" gap="middle" style={{ marginTop: '40px' }}>
                                <Typography>
                                    <Text style={{ fontWeight: 700, color: 'grey' }}>
                                        {isOwner
                                            ? 'Você ainda não criou nenhuma coleção'
                                            : 'Este usuário ainda não criou nenhuma coleção'}
                                    </Text>
                                </Typography>
                                <Doodle customEyePosition="center" customMouthStyle="sad" width={80} height={120} />
                            </Flex>
                        </Col>
                    ) : (
                        <>
                            {allSavedCard}
                            {allCollections.map((collection) => (
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} key={collection.id}>
                                    <Card
                                        hoverable
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            position: 'relative'
                                        }}
                                    >
                                        <Flex vertical gap="small">
                                            <Flex justify="space-between" align="center">
                                                <Tooltip title={collection.nome}>
                                                    <Text strong style={{ fontSize: '16px', textOverflow: 'ellipsis', maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                        {collection.nome}
                                                    </Text>
                                                </Tooltip>
                                                <Tag color="blue">Coleção</Tag>
                                            </Flex>

                                            <Divider style={{ margin: '8px 0' }} />

                                            <Flex vertical gap="4px">
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Criada em {new Date(collection.created_at).toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </Text>

                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {collection.count_documentos === 0
                                                        ? 'Nenhum resumo salvo'
                                                        : `${collection.count_documentos} ${collection.count_documentos === 1 ? 'resumo salvo' : 'resumos salvos'}`
                                                    }
                                                </Text>
                                            </Flex>

                                        </Flex>
                                        <Flex gap="small" style={{ marginTop: '8px', position: 'absolute', bottom: '7%', left: '25px' }}>
                                            <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/profile/${user_id}/collection/${collection.id}`)}>
                                                Ver resumos
                                            </Button>
                                            {isOwner && (
                                                <Popconfirm
                                                    title="Deletar a coleção?"
                                                    description="Deseja realmente deletar a coleção?"
                                                    onConfirm={() => handleDeleteCollection(collection.id)}
                                                    disabled={deleting}
                                                >
                                                    <Button type="link" danger style={{ padding: 0 }}>
                                                        Excluir
                                                    </Button>
                                                </Popconfirm>
                                            )}
                                        </Flex>
                                    </Card>
                                </Col>
                            ))}
                        </>
                    )}
                </Row>

                {userCollections && userCollections.last_page > 1 && page < userCollections.last_page && (
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
                            Mostrar mais
                        </Button>
                    </div>
                )}

                {userCollections && page === userCollections.last_page && page > 1 && allCollections.length > 0 && (
                    <Flex vertical align="center" style={{ marginTop: '1.5vh' }}>
                        <Divider size="large" />
                        <Typography>
                            <Text style={{ fontWeight: 700, color: 'grey' }}>Parece que você chegou ao fim!</Text>
                        </Typography>
                        <Doodle customEyePosition="top" customMouthStyle="surprise" width={80} height={120} />
                    </Flex>
                )}

                {isFetching && page > 1 && (
                    <Spin size="default" />
                )}
            </Flex>

            <CreateCollection
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
            />
        </>
    );
}