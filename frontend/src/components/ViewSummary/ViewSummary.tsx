import { Button, Card, Divider, Dropdown, Flex, Grid, Image, message, Modal, QRCode, Space, Tag, Tooltip, Typography } from "antd"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSummaryById } from "../../service/SummariesService";
import type { TResponseSummary, TTypesSummary } from "../../types/SummaryTypes";
import type { NoticeType } from "antd/es/message/interface";
import { CloudDownloadOutlined, CopyOutlined, DislikeOutlined, DownloadOutlined, HeartOutlined, LeftOutlined, MoreOutlined, RightOutlined, RotateLeftOutlined, RotateRightOutlined, ShareAltOutlined, SmileOutlined, SwapOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { IFrameYoutubeStyle, PreviewImageActionsStyle, UserInteractionButtonsStyle, YoutubeVideoFrameContainerStyle } from "./Style";
import Title from "antd/es/typography/Title";
import "./ReadmeStyle.css";
import "./PreviewImageActionsStyle.css";
import '@wooorm/starry-night/style/dark';
import { getImageByDocumentId } from "../../service/DocumentsService";
import { Link, useParams, useSearchParams } from "react-router";
import { createOrUpdateReview, deleteReview } from "../../service/ReviewService";
import { ReadmeMarkdown } from "../ReadmeMarkdown/ReadmeMarkdown";
import mainIcon from '../../assets/icons/logo.svg';
import { SaveToCollection } from "../SaveToCollection/SaveToCollection";
import { useAuth } from "../../context/AuthContext";
import { shareSocialMedia } from "../../utils/ShareSoccialMedia";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface IViewSummaryProps {
    open: boolean,
    onClose: () => void,
    id: string | undefined,
    onlyDeletedContent: number,
    onNext?: () => void,
    onPrevious?: () => void,
    hasNext?: boolean,
    hasPrevious?: boolean,
    isNavigating?: boolean
}

type TTagTypes = 'p1' | 'p2' | 'p3' | 'pf' | 'outros';

export const ViewSummary = ({
    open,
    onClose,
    id,
    onlyDeletedContent = 0,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
    isNavigating = false
}: IViewSummaryProps) => {

    const screens = useBreakpoint();
    const isMobile = !screens.lg;
    const isSmallMobile = !screens.sm;

    const [messageApi, contextHolder] = message.useMessage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user_id } = useParams();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [summaryData, setSummaryData] = useState<TResponseSummary>();
    const [summaryDocType, setSummaryDocType] = useState<TTypesSummary>();
    const [tagColor, setTagColor] = useState<any>();
    const [summaryImage, setSummaryImage] = useState<string | null>(null);

    const [userReview, setUserReview] = useState<'perfeito' | 'util' | 'confuso' | null>(null);

    const [reviewCounts, setReviewCounts] = useState({
        util_count: 0,
        perfeito_count: 0,
        confuso_count: 0
    });

    const textDisplayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && id) {
            loadSummaryData();
            addParam();
        }
    }, [open, id, onlyDeletedContent]);

    useEffect(() => {
        randomColor()
    }, []);

    useEffect(() => {
        if (!open || isMobile) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isNavigating) return;
            if (e.key === 'ArrowRight' && hasNext && onNext) {
                onNext();
            } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
                onPrevious();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, isMobile, isNavigating, hasNext, hasPrevious, onNext, onPrevious]);

    const addParam = () => {
        if (id) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('summary', id);
            setSearchParams(newParams);
        }
    };

    const removeParam = () => {
        setSearchParams({});
    };

    const loadImage = async (documentId: string) => {
        try {
            const blob = await getImageByDocumentId(documentId);

            if (!(blob instanceof Blob)) {
                throw new Error('Resposta não é um Blob válido');
            }

            return new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSummaryImage(reader.result as string);
                    resolve();
                };
                reader.onerror = () => {
                    reject(new Error('Falha ao ler o blob'));
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            showMessage('Falha ao carregar imagem', 'error');
            setSummaryImage(null);
        }
    };

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        return messageApi.open({
            content: msg,
            type: type,
            duration: duration,
        });
    }

    const loadSummaryData = () => {
        if (open && id) {
            setIsLoading(true);
            getSummaryById(id, onlyDeletedContent)
                .then((response: TResponseSummary) => {
                    setSummaryData(response);
                    setSummaryDocType(response.data.data.tipo);

                    setReviewCounts({
                        util_count: response.data.data.util_count || 0,
                        perfeito_count: response.data.data.perfeito_count || 0,
                        confuso_count: response.data.data.confuso_count || 0
                    });

                    if (response.data.data.reviews && response.data.data.reviews.length > 0) {
                        setUserReview(response.data.data.reviews[0].review)
                    } else {
                        setUserReview(null);
                    }

                    setIsLoading(false);

                    if (response.data.data.tipo === 'imagem') {
                        loadImage(id);
                    }
                })
                .catch(() => {
                    showMessage("Falha ao carregar resumo.", "error")
                        .then(() => {
                            setIsLoading(false);
                            handleClose();
                        });
                });
        }
    }

    const TextRender = () => {
        useEffect(() => {
            if (textDisplayRef.current && summaryData?.data.data.conteudo_texto) {
                try {
                    // Tenta parsear como Delta JSON (formato do Quill)
                    const delta = JSON.parse(summaryData.data.data.conteudo_texto);
                    const tempQuill = new Quill(document.createElement('div'));
                    tempQuill.setContents(delta);
                    textDisplayRef.current.innerHTML = tempQuill.root.innerHTML;
                } catch {
                    // Se falhar, trata como texto simples (backward compatibility)
                    textDisplayRef.current.innerHTML = `<p style="white-space: pre-wrap;">${summaryData.data.data.conteudo_texto}</p>`;
                }
            }
        }, [summaryData?.data.data.conteudo_texto]);

        return (
            <div
                ref={textDisplayRef}
                className="ql-editor"
                style={{
                    backgroundColor: 'white',
                    minHeight: '200px',
                    padding: '12px 15px',
                    borderRadius: '4px',
                    fontSize: isSmallMobile ? '14px' : '16px'
                }}
            />
        );
    }

    const ImageRender = () => {
        if (!summaryImage) {
            return (
                <Flex justify="center" align="center" style={{ height: '200px', padding: isMobile ? '12px' : '24px' }}>
                    <Text>Carregando imagem...</Text>
                </Flex>
            );
        }

        return (
            <Flex vertical gap="middle" align="center" style={{ width: '100%' }}>
                <Image
                    loading="lazy"
                    src={summaryImage}
                    alt={summaryData?.data.data.titulo || 'Imagem do documento'}
                    style={{
                        width: '100%',
                        maxHeight: isMobile ? '400px' : '600px',
                        objectFit: 'contain'
                    }}
                    preview={{
                        mask: 'Ampliar imagem',
                        src: summaryImage,
                        toolbarRender: (
                            _,
                            {
                                transform: { scale },
                                actions: {
                                    onFlipY,
                                    onFlipX,
                                    onRotateLeft,
                                    onRotateRight,
                                    onZoomOut,
                                    onZoomIn,
                                },
                            },
                        ) => (
                            <Space size={isMobile ? 12 : 20} className="toolbar-wrapper">
                                <DownloadOutlined style={PreviewImageActionsStyle} onClick={downloadImage} />
                                <SwapOutlined style={PreviewImageActionsStyle} rotate={90} onClick={onFlipY} />
                                <SwapOutlined style={PreviewImageActionsStyle} onClick={onFlipX} />
                                <RotateLeftOutlined style={PreviewImageActionsStyle} onClick={onRotateLeft} />
                                <RotateRightOutlined style={PreviewImageActionsStyle} onClick={onRotateRight} />
                                <ZoomOutOutlined style={PreviewImageActionsStyle} disabled={scale === 1} onClick={onZoomOut} />
                                <ZoomInOutlined style={PreviewImageActionsStyle} disabled={scale === 50} onClick={onZoomIn} />
                            </Space>
                        ),
                    }}
                />
            </Flex>
        );
    };

    const YoutubeEmbedRender = () => {
        return (
            <div style={{
                ...YoutubeVideoFrameContainerStyle,
                paddingBottom: isMobile ? '100%' : '56.25%',
                minHeight: isMobile ? '400px' : 'auto'
            }}>
                <iframe
                    style={IFrameYoutubeStyle}
                    src={summaryData?.data.data.conteudo_texto || ''}
                    title="YouTube video player"
                    allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    const SummaryDocTypeRender = useMemo(() => {
        switch (summaryDocType) {
            case 'readme':
                return <ReadmeMarkdown key={`readme-${id}`} content={summaryData?.data.data.conteudo_texto || ''} />
            case 'txt':
                return <TextRender />
            case 'imagem':
                return <ImageRender />
            case 'youtube_link':
                return <YoutubeEmbedRender />
            default:
                return null;
        }
    }, [summaryDocType, summaryData?.data.data.conteudo_texto, summaryImage, id, isMobile, isSmallMobile]);

    function formateDate(dataString: string | undefined) {

        if (dataString == undefined) return '';

        const meses = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];

        const data = new Date(dataString);

        if (isNaN(data.getTime())) {
            throw new Error('Data inválida');
        }

        const dia = String(data.getDate()).padStart(2, '0');
        const mes = meses[data.getMonth()];
        const ano = data.getFullYear();

        return `${dia} de ${mes} de ${ano}`;

    }

    const getMenuItems = () => {

        let baseItems = [{
            key: '1',
            label: (
                <Text><CloudDownloadOutlined /> Baixar {summaryData?.data.data.tipo == 'txt' ? 'texto' : summaryData?.data.data.tipo}</Text>
            ),
            onClick: () => downloadContent()
        }];

        if (summaryDocType !== 'imagem') {
            baseItems.push(
                {
                    key: '0',
                    label: (
                        <Text><CopyOutlined /> Copiar {summaryData?.data.data.tipo == 'txt' ? 'texto' : summaryData?.data.data.tipo}</Text>
                    ),
                    onClick: () => copyContent()
                },);
        }

        return baseItems;
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

    const getShareItems = () => {
        let items = [
            {
                key: '1',
                label: (
                    <>
                        <Button onClick={copyShareLink} style={UserInteractionButtonsStyle} icon={<CopyOutlined />} >Copiar link</Button>
                    </>
                ),
            },
            {
                key: '2',
                label: (
                    <>
                        <QRCode
                            id="myqrcode"
                            icon={mainIcon}
                            value={`${window.location.origin}/summary?summary=${summaryData?.data.data.id}`}
                            size={isMobile ? 150 : 200}
                        />
                    </>
                )
            },
            {
                key: '3',
                label: (
                    <Button type="link" onClick={downloadCanvasQRCode} icon={<CloudDownloadOutlined />}>Baixar QR code</Button>
                )
            },
            {
                key: '4',
                label: (
                    <Button type="link" onClick={() => shareSocialMedia(`${summaryData?.data.data.titulo}`, '', `${window.location.href}`)} icon={<ShareAltOutlined />}>Compartilhar</Button>
                )
            }
        ];
        return items;
    }

    const randomColor = () => {
        const options = ['#4096ff', '#da3c76', '#50d295'];

        let n = Math.floor(Math.random() * options.length);
        setTagColor(options[n]);
    }

    const getTagColor = (tag: TTagTypes | undefined) => {
        switch (tag) {
            case 'p1':
                return '#3f31ff';
            case 'p2':
                return '#31ff64';
            case 'p3':
                return '#1affec';
            case 'pf':
                return '#ff29bf';
            case 'outros':
                return '#ff4545';
            default:
                return '#ff9924'

        }
    }

    const extractTextFromQuill = (content: string): string => {
        try {
            // Tenta parsear como Delta JSON
            const delta = JSON.parse(content);
            const tempQuill = new Quill(document.createElement('div'));
            tempQuill.setContents(delta);
            return tempQuill.getText();
        } catch {
            // Se falhar, retorna como texto simples
            return content;
        }
    };

    const copyContent = async () => {
        if (summaryData?.data.data.tipo === 'txt' || summaryData?.data.data.tipo === 'readme') {
            try {
                const content = summaryData?.data.data.tipo === 'txt'
                    ? extractTextFromQuill(summaryData.data.data.conteudo_texto || '')
                    : summaryData.data.data.conteudo_texto || '';

                await navigator.clipboard.writeText(content);
                showMessage('Copiado!', 'success');
            } catch (err) {
                showMessage('Falha ao copiar', 'error');
            }
        }
    }

    const downloadImage = () => {
        if (!summaryImage) {
            showMessage('Nenhuma imagem para baixar', 'warning');
            return;
        }

        try {
            const match = summaryImage.match(/^data:(image\/\w+);base64,/);
            const mimeType = match ? match[1] : 'image/png';
            const extension = mimeType.split('/')[1] || 'png';

            fetch(summaryImage)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const filename = `${summaryData?.data.data.titulo.replace(/\s/g, '_')}.${extension}`;

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    URL.revokeObjectURL(url);
                    showMessage('Download da imagem iniciado!', 'success');
                })
                .catch(() => {
                    showMessage('Falha ao baixar imagem', 'error');
                });

        } catch (error) {
            showMessage('Falha ao processar imagem para download', 'error');
        }
    };

    const downloadContent = () => {
        if (summaryDocType === 'imagem') {
            downloadImage();
            return;
        }

        if (summaryData?.data.data.tipo === 'txt' || summaryData?.data.data.tipo === 'readme') {
            const rawContent = summaryData.data.data.conteudo_texto;

            if (!rawContent) {
                showMessage('Nenhum conteúdo para baixar', 'warning');
                return;
            }

            try {
                const content = summaryData.data.data.tipo === 'txt'
                    ? extractTextFromQuill(rawContent)
                    : rawContent;

                const fileExtension = summaryData.data.data.tipo === 'readme' ? 'md' : 'txt';
                const filename = `${summaryData.data.data.titulo.replace(/\s/g, '_')}.${fileExtension}`;

                const blob = new Blob([content], {
                    type: summaryData.data.data.tipo == 'readme'
                        ? 'text/markdown'
                        : 'text/plain'
                });

                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);

                showMessage('Download iniciado!', 'success');
            } catch (e) {
                showMessage('Falha ao baixar arquivo', 'error');
            }
        }
    };

    const copyShareLink = async () => {
        try {
            const shareLink = `${window.location.origin}/summary?summary=${summaryData?.data.data.id}`
            await navigator.clipboard.writeText(shareLink);

            showMessage('Link copiado!', 'success');
        } catch (e) {
            showMessage('Falha ao copiar', 'error');
        }
    }

    const handleUserReview = useCallback((reviewType: 'util' | 'perfeito' | 'confuso') => {
        if (!id) return;

        const previousReview = userReview;

        try {
            if (previousReview === reviewType) {
                deleteReview(id)
                setUserReview(null);
                setReviewCounts(prev => ({
                    ...prev,
                    [`${reviewType}_count`]: Math.max(0, prev[`${reviewType}_count`] - 1)
                }));

            } else {
                createOrUpdateReview(reviewType, id);

                setReviewCounts(prev => {
                    const newCounts = { ...prev };
                    if (previousReview) {
                        newCounts[`${previousReview}_count`] = Math.max(0, prev[`${previousReview}_count`] - 1);
                    }

                    newCounts[`${reviewType}_count`] = (prev[`${reviewType}_count`] || 0) + 1;

                    return newCounts;
                });

                setUserReview(reviewType);
            }

        } catch (error) {
            showMessage('Falha ao enviar feedback', 'error');
        }
    }, [id, userReview]);

    const getReviewButtonColor = useCallback((type: 'perfeito' | 'util' | 'confuso') => {
        if (userReview !== type) return undefined;

        switch (type) {
            case 'perfeito':
                return '#ff4d4f';
            case 'util':
                return '#52c41a';
            case 'confuso':
                return '#1890ff';
            default:
                return undefined;
        }
    }, [userReview]);

    const handleClose = () => {
        removeParam();
        onClose();
    }

    const ReviewButtons = useMemo(() => (
        <Flex
            gap={isSmallMobile ? "4px" : "8px"}
            align="center"
            wrap="wrap"
        >
            <Tooltip title="Perfeito!">
                <Button
                    size={isSmallMobile ? "small" : "middle"}
                    style={UserInteractionButtonsStyle}
                    icon={
                        <HeartOutlined
                            style={{
                                color: getReviewButtonColor('perfeito'),
                                fontSize: isSmallMobile ? '16px' : '18px'
                            }}
                        />
                    }
                    onClick={() => handleUserReview('perfeito')}
                />
            </Tooltip>
            <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                {reviewCounts.perfeito_count > 999
                    ? ((reviewCounts.perfeito_count / 1000).toFixed(1) + 'k')
                    : reviewCounts.perfeito_count}
            </Text>

            <Tooltip title="Util">
                <Button
                    size={isSmallMobile ? "small" : "middle"}
                    style={UserInteractionButtonsStyle}
                    icon={
                        <SmileOutlined
                            style={{
                                color: getReviewButtonColor('util'),
                                fontSize: isSmallMobile ? '16px' : '18px'
                            }}
                        />
                    }
                    onClick={() => handleUserReview('util')}
                />
            </Tooltip>
            <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                {reviewCounts.util_count > 999
                    ? ((reviewCounts.util_count / 1000).toFixed(1) + 'k')
                    : reviewCounts.util_count}
            </Text>
            <Tooltip title="Confuso">
                <Button
                    size={isSmallMobile ? "small" : "middle"}
                    style={UserInteractionButtonsStyle}
                    icon={
                        <DislikeOutlined
                            style={{
                                color: getReviewButtonColor('confuso'),
                                fontSize: isSmallMobile ? '16px' : '18px'
                            }}
                        />
                    }
                    onClick={() => handleUserReview('confuso')}
                />
            </Tooltip>
            <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                {reviewCounts.confuso_count > 999
                    ? ((reviewCounts.confuso_count / 1000).toFixed(1) + 'k')
                    : reviewCounts.confuso_count}
            </Text>
        </Flex>
    ), [reviewCounts, userReview, handleUserReview, getReviewButtonColor, isSmallMobile]);

    return (
        <>
            {contextHolder}
            {!isMobile && open && hasPrevious && onPrevious && (
                <Button
                    shape="circle"
                    size="large"
                    icon={<LeftOutlined />}
                    onClick={onPrevious}
                    loading={isNavigating}
                    aria-label="Resumo anterior"
                    style={{
                        position: 'fixed',
                        left: '24px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1100
                    }}
                />
            )}
            {!isMobile && open && hasNext && onNext && (
                <Button
                    shape="circle"
                    size="large"
                    icon={<RightOutlined />}
                    onClick={onNext}
                    loading={isNavigating}
                    aria-label="Próximo resumo"
                    style={{
                        position: 'fixed',
                        right: '24px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1100
                    }}
                />
            )}
            <Modal
                loading={isLoading}
                open={open}
                onCancel={handleClose}
                width={{
                    xs: '98%',
                    sm: '90%',
                    md: '85%',
                    lg: '80%',
                    xl: '75%',
                    xxl: '70%',
                }}
                styles={{
                    body: {
                        maxHeight: isMobile ? '70vh' : '80vh',
                        overflowY: 'auto',
                        padding: isMobile ? '12px' : '24px'
                    }
                }}
                footer={[
                    ...(isMobile && (onPrevious || onNext)
                        ? [
                            <Button
                                key='previous'
                                icon={<LeftOutlined />}
                                onClick={onPrevious}
                                disabled={!hasPrevious || isNavigating}
                                loading={isNavigating}
                            >
                                Anterior
                            </Button>,
                            <Button
                                key='next'
                                icon={<RightOutlined />}
                                iconPosition="end"
                                onClick={onNext}
                                disabled={!hasNext || isNavigating}
                                loading={isNavigating}
                            >
                                Próximo
                            </Button>
                        ]
                        : []),
                    <Button key='close' onClick={handleClose}>Fechar</Button>
                ]}
            >
                <Card
                    style={{
                        marginBottom: isMobile ? '8px' : '16px',
                        padding: isMobile ? '8px' : '16px'
                    }}
                    bodyStyle={{
                        padding: (summaryDocType === 'imagem' || summaryDocType === 'youtube_link')
                            ? '0'
                            : (isMobile ? '12px' : '24px')
                    }}
                >
                    <Flex vertical>
                        {(summaryDocType === 'imagem' || summaryDocType === 'youtube_link') ? (
                            <>
                                <div style={{ padding: isMobile ? '12px' : '24px', paddingBottom: 0 }}>
                                    <Typography>
                                        <Title
                                            level={isMobile ? 4 : 3}
                                            style={{
                                                marginBottom: isMobile ? '8px' : '16px',
                                                fontSize: isSmallMobile ? '18px' : isMobile ? '20px' : '24px',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {summaryData?.data.data.titulo}
                                        </Title>
                                    </Typography>
                                    <Divider style={{ margin: isMobile ? '8px 0' : '16px 0' }} />
                                </div>
                                {SummaryDocTypeRender}
                            </>
                        ) : (
                            <>
                                <Typography>
                                    <Title
                                        level={isMobile ? 4 : 3}
                                        style={{
                                            marginBottom: isMobile ? '8px' : '16px',
                                            fontSize: isSmallMobile ? '18px' : isMobile ? '20px' : '24px',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {summaryData?.data.data.titulo}
                                    </Title>
                                </Typography>
                                <Divider style={{ margin: isMobile ? '8px 0' : '16px 0' }} />
                                {SummaryDocTypeRender}
                            </>
                        )}
                    </Flex>
                </Card>
                <Card
                    bodyStyle={{
                        padding: isMobile ? '12px' : '24px'
                    }}
                >
                    <Flex
                        vertical
                        gap={isMobile ? '8px' : '16px'}
                    >
                        <Flex
                            gap={isMobile ? '8px' : '1vh'}
                            wrap="wrap"
                            style={{ fontSize: isSmallMobile ? '12px' : '14px' }}
                        >
                            <Text>Postado por:&nbsp;
                                {user_id && user_id == summaryData?.data.data.user_id ? (
                                    <Text style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                                        {summaryData?.data.data.user.nome} {summaryData?.data.data.user.sobrenome}
                                    </Text>
                                ) : (
                                    <Link to={`/profile/${summaryData?.data.data.user.id}`}>
                                        <Text style={{ textDecoration: 'underline' }}>
                                            {summaryData?.data.data.user.nome} {summaryData?.data.data.user.sobrenome}
                                        </Text>
                                    </Link>
                                )}
                            </Text>
                            {!isSmallMobile && (
                                <Divider type="vertical" style={{ background: '#d1d1d1', height: '20px' }} />
                            )}
                            <Text>{formateDate(summaryData?.data.data.created_at)}</Text>
                        </Flex>
                        <Flex wrap="wrap" gap={isMobile ? '8px' : '12px'} align="center">
                            <Flex align="center" gap="8px">
                                <Tag
                                    color={tagColor}
                                    style={{ fontSize: isSmallMobile ? '11px' : '12px' }}
                                >
                                    {summaryData?.data.data.materia.sigla}
                                </Tag>
                                <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                    {summaryData?.data.data.materia.nome}
                                </Text>
                            </Flex>
                            {!isSmallMobile && (
                                <Divider type="vertical" style={{ background: '#d1d1d1', height: '20px' }} />
                            )}
                            <Tag
                                color={getTagColor(summaryData?.data.data.tag)}
                                style={{ fontSize: isSmallMobile ? '11px' : '12px' }}
                            >
                                {summaryData?.data.data.tag.toUpperCase()}
                            </Tag>
                        </Flex>
                    </Flex>
                    <Divider style={{ margin: isMobile ? '12px 0' : '16px 0' }} />
                    <Flex
                        gap={isMobile ? "8px" : "16px"}
                        justify="space-between"
                        wrap={isMobile ? "wrap" : "nowrap"}
                        align={isMobile ? "flex-start" : "center"}
                    >
                        <Flex style={{ minWidth: isMobile ? '100%' : 'auto' }}>
                            {ReviewButtons}
                        </Flex>
                        <Flex
                            gap={isSmallMobile ? "8px" : "13px"}
                            style={{
                                fontSize: isSmallMobile ? '18px' : '20px',
                                marginTop: isMobile ? '8px' : '0'
                            }}
                        >
                            <Tooltip title="Compartilhar">
                                <Dropdown menu={{ items: getShareItems() }} trigger={['click']}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        <Space style={{ fontSize: 'inherit', color: 'black' }}>
                                            <ShareAltOutlined />
                                        </Space>
                                    </a>
                                </Dropdown>
                            </Tooltip>
                            <SaveToCollection
                                documentId={id || ''}
                                userId={user?.user_id || ''}
                            />
                            {summaryData?.data.data.tipo !== 'youtube_link' && (
                                <Tooltip title="Abrir menu">
                                    <Dropdown menu={{ items: getMenuItems() }} trigger={['click']}>
                                        <a onClick={(e) => e.preventDefault()}>
                                            <Space style={{ fontSize: 'inherit', color: 'black' }}>
                                                <MoreOutlined />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            )}
                        </Flex>
                    </Flex>
                </Card>
            </Modal>
        </>
    )
}