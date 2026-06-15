import { useState, useEffect, useRef } from "react";
import { Button, Card, Divider, Flex, message, Spin, Tooltip, Typography } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import { getUserCollections } from "../../service/CollectionsService";
import { addDocumentToCollection, checkDocumentInCollections, removeDocumentFromCollection } from "../../service/CollectionDocument";
import type { NoticeType } from "antd/es/message/interface";
import { CreateCollection } from "../CreateCollection/CreateCollection";

const { Text } = Typography;

interface TCollection {
    id: string;
    nome: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    count_documentos: number;
    is_saved?: boolean;
}

interface ISaveToCollectionProps {
    documentId: string;
    userId: string;
}

export function SaveToCollection({ documentId, userId }: ISaveToCollectionProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const [showCollections, setShowCollections] = useState(false);
    const [collections, setCollections] = useState<TCollection[]>([]);
    const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [defaultCollectionId, setDefaultCollectionId] = useState<string | null>(null);

    const hoverTimeoutRef = useRef<NodeJS.Timeout>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showCollections) {
            loadCollectionsAndCheckSaved();
        }
    }, [showCollections]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowCollections(false);
            }
        };

        if (showCollections) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCollections]);

    useEffect(() => {
        if (documentId) {
            checkIfSaved();
        }
    }, [documentId]);

    const checkIfSaved = async () => {
        if (!documentId) return;

        try {
            const response = await checkDocumentInCollections(documentId);
            const savedIds = response.data.data.saved_in || [];
            setSavedCollectionIds(savedIds);
            setIsSaved(savedIds.length > 0);

            if (savedIds.length > 0) {
                setDefaultCollectionId(savedIds[0]);
            }
        } catch (error) {
            console.log("ERROR checkIfSaved:", error);
        }
    };

    const loadCollectionsAndCheckSaved = async () => {
        if (!documentId) return;

        setIsLoading(true);
        try {
            const [collectionsResponse, savedResponse] = await Promise.all([
                getUserCollections(userId, 1, false),
                checkDocumentInCollections(documentId)
            ]);

            const collectionsData = collectionsResponse.data.data.data;
            const savedIds = savedResponse.data.data.saved_in || [];

            setSavedCollectionIds(savedIds);

            const collectionsWithSavedStatus = collectionsData.map((col: TCollection) => ({
                ...col,
                is_saved: savedIds.includes(col.id)
            }));

            setCollections(collectionsWithSavedStatus);
            setIsSaved(savedIds.length > 0);
        } catch (error) {
            showMessage('Falha ao carregar coleções', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        });
    };

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowCollections(true);
        }, 1500);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    const handleQuickSave = async () => {
        if (showCollections) return;

        try {
            const isSavedInGeneral = savedCollectionIds.some(id => id === null || id === 'null' || id === '');
            if (isSavedInGeneral) {
                await removeDocumentFromCollection(documentId, null);
                await checkIfSaved();
                showMessage('Removido dos salvos', 'success');
            } else {
                await addDocumentToCollection(documentId, null);
                await checkIfSaved();
                showMessage('Salvo com sucesso!', 'success');
            }

        } catch (error: any) {

            if (error?.response?.status === 404) {
                showMessage('Documento não encontrado nos salvos', 'warning');
            } else if (error?.response?.status === 422) {
                showMessage(error?.response?.data?.message || 'Documento já está salvo', 'warning');
            } else {
                showMessage('Falha ao salvar', 'error');
            }
        }
    };

    const handleToggleCollection = async (collectionId: string, collectionName: string, currentlySaved: boolean) => {
        try {
            if (currentlySaved) {
                await removeDocumentFromCollection(documentId, collectionId);

                setSavedCollectionIds(prev => {
                    const newIds = prev.filter(id => id !== collectionId);
                    setIsSaved(newIds.length > 0);

                    if (defaultCollectionId === collectionId && newIds.length > 0) {
                        setDefaultCollectionId(newIds[0]);
                    } else if (newIds.length === 0) {
                        setDefaultCollectionId(null);
                    }

                    return newIds;
                });

                setCollections(prev =>
                    prev.map(col =>
                        col.id === collectionId
                            ? { ...col, is_saved: false, count_documentos: Math.max(0, col.count_documentos - 1) }
                            : col
                    )
                );

                showMessage(`Removido de "${collectionName}"`, 'success');
            } else {
                await addDocumentToCollection(documentId, collectionId);

                setSavedCollectionIds(prev => {
                    const newIds = [...prev, collectionId];
                    setIsSaved(true);

                    if (!defaultCollectionId) {
                        setDefaultCollectionId(collectionId);
                    }

                    return newIds;
                });

                setCollections(prev =>
                    prev.map(col =>
                        col.id === collectionId
                            ? { ...col, is_saved: true, count_documentos: col.count_documentos + 1 }
                            : col
                    )
                );

                showMessage(`Adicionado à "${collectionName}"`, 'success');
            }
        } catch (error) {
            showMessage('Falha ao atualizar coleção', 'error');
        }
    };

    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        setShowCollections(false);
    };

    const closeCreateModal = (shouldReload: boolean) => {
        setIsCreateModalOpen(false);
        if (shouldReload) {
            loadCollectionsAndCheckSaved();
            setShowCollections(true);
        }
    };

    return (
        <>
            {contextHolder}
            <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
                <Tooltip title={showCollections ? "" : "Salvar"}>
                    <Button
                        type="text"
                        icon={<BookOutlined style={{ color: isSaved ? '#1890ff' : 'black', fontSize: '20px' }} />}
                        onClick={handleQuickSave}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                </Tooltip>

                {showCollections && (
                    <Card
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: '8px',
                            width: '280px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        bodyStyle={{ padding: '8px' }}
                    >
                        <Flex vertical gap="small">
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={openCreateModal}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    height: '40px',
                                    fontWeight: 600
                                }}
                            >
                                Criar coleção
                            </Button>

                            {collections.length > 0 && <Divider style={{ margin: '4px 0' }} />}

                            {isLoading ? (
                                <Flex justify="center" align="center" style={{ padding: '20px' }}>
                                    <Spin size="small" />
                                </Flex>
                            ) : collections.length === 0 ? (
                                <Flex justify="center" align="center" style={{ padding: '20px' }}>
                                    <Text type="secondary" style={{ fontSize: '13px', textAlign: 'center' }}>
                                        Nenhuma coleção criada.<br />Crie uma para salvar resumos
                                    </Text>
                                </Flex>
                            ) : (
                                collections.map((collection) => (
                                    <Button
                                        key={collection.id}
                                        type="text"
                                        onClick={() => handleToggleCollection(
                                            collection.id,
                                            collection.nome,
                                            collection.is_saved || false
                                        )}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            height: 'auto',
                                            padding: '8px 12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: collection.is_saved ? '#f0f5ff' : 'transparent'
                                        }}
                                    >
                                        <Flex vertical gap="2px" style={{ flex: 1, overflowX: 'hidden' }}>
                                            <Tooltip title={collection.nome}>
                                                <Text strong>{collection.nome}</Text>
                                            </Tooltip>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {collection.count_documentos} {collection.count_documentos === 1 ? 'resumo' : 'resumos'}
                                            </Text>
                                        </Flex>
                                        {collection.is_saved && (
                                            <BookOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                        )}
                                    </Button>
                                ))
                            )}
                        </Flex>
                    </Card>
                )}
            </div>

            <CreateCollection
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
            />
        </>
    );
}