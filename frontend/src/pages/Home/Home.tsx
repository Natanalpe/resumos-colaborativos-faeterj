import { Link } from "react-router";
import { useSearchParams } from 'react-router-dom';
import Text from "antd/es/typography/Text";
import { useEffect, useState } from "react";
import Title from "antd/es/typography/Title";
import logo from '../../assets/icons/logo.svg';
import { Content } from "antd/es/layout/layout";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import Typography from "antd/es/typography/Typography";
import { getAllNews } from "../../service/NewsService";
import { BLUE_LINEAR_GRADIENT } from "../../Global/Styles";
import type { NoticeType } from "antd/es/message/interface";
import doodleSideLookSmile from '../../assets/images/doodleSideLookSmile.svg';
import { LinkToCard } from "../../components/LinkCard/LinkCard";
import UploadSummary from "../../components/Upload/UploadSummary";
import { getLastSummaries } from "../../service/SummariesService";
import { Avatar, Button, Card, Flex, Image, Layout, message, Spin, Carousel, Modal, Grid } from "antd";
import type { NewsResponse, TNews, TNewsResponsePageable } from "../../types/News";
import {
    getCardTopStyle,
    getContentLayoutStyle,
    getContentNewsStyle,
    getContentSiderStyle,
    getActionButtonsStyle,
    getMobileButtonStyle,
    getMobileCardStyle,
    layoutStyle,
} from "./Styles";
import CardSummary from "../../components/CardSummary/CardSummary";
import './Home.css';
import { Doodle } from "../../components/Doodle/Doodle";
import { ViewSummary } from "../../components/ViewSummary/ViewSummary";
import Rules from "../../components/Rules/Rules";

const { useBreakpoint } = Grid;

export default function Home() {
    const [searchParams] = useSearchParams();
    const firstloginSession = sessionStorage.getItem('firstLogin') === 'true';
    const firstloginParam = searchParams.get('firstlogin') === '1';
    const firstlogin = firstloginSession || firstloginParam;

    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const showSidebar = screens.xxl;

    const [news, setNews] = useState<TNewsResponsePageable | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoadingMoreNews, setIsLoadingMoreNews] = useState(false);
    const [isLoadingLastSummaries, setIsLoadingLastSummaries] = useState(false);
    const [lastSummaries, setLastSummaries] = useState<any>();
    const [summaryId, setSummaryId] = useState<string>();
    const [viewSummaryIdOpen, setViewSummaryIdOpen] = useState<boolean>(false);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);

    useEffect(() => {
        if (firstlogin) {
            showMessage('Este é seu primeiro login, por favor leia as regras da plataforma', 'info');
            openRulesModal();
            sessionStorage.removeItem('firstLogin');
        }

        getAllNews()
            .then((response: NewsResponse) => {
                setNews(response.data);
            })
            .catch(_ => {
                showMessage('Erro ao carregar notícias', 'error');
            });

        loadLastSummaries();

        const urlParams = new URLSearchParams(window.location.search);
        const summaryId = urlParams.get('summary');

        if (summaryId) {
            setSummaryId(summaryId);
            setViewSummaryIdOpen(true);
        }

    }, []);

    const closeViewSummary = () => setViewSummaryIdOpen(false);

    const loadLastSummaries = () => {
        setIsLoadingLastSummaries(true);

        getLastSummaries(5)
            .then((response: any) => {
                setLastSummaries(response.data.data);
                setIsLoadingLastSummaries(false);
            })
            .catch(() => {
                setIsLoadingLastSummaries(false);
            })
    }

    const loadMoreNews = () => {
        setIsLoadingMoreNews(true);
        if (!news || !news.data.next_page_url) return;
        getAllNews(news.data.next_page_url)
            .then((response: NewsResponse) => {
                setNews(prev => ({
                    ...response.data,
                    data: {
                        ...response.data.data,
                        data: [...prev?.data.data || [], ...response.data.data.data]
                    }
                }));
                setIsLoadingMoreNews(false);
            })
            .catch(_ => {
                showMessage('Erro ao carregar mais notícias:', 'error');
                setIsLoadingMoreNews(false);
            });
    };

    const showMessage = (content: string, type: NoticeType) => {
        messageApi.open({
            type: type,
            content: content,
            duration: 3
        });
        message.config({ rtl: false });
    }

    const openCreateModal = () => {
        setCreateModalIsOpen(true);
    }

    const closeUploadModal = () => {
        setCreateModalIsOpen(false);
    }

    const openRulesModal = () => setIsRulesModalOpen(true);
    const closeRulesModal = () => setIsRulesModalOpen(false);

    return (
        <>
            {contextHolder}
            <Layout style={layoutStyle}>
                <Layout>
                    <Layout style={getContentLayoutStyle(isMobile)}>
                        <Content style={getContentNewsStyle(showSidebar || false, isMobile)}>
                            <Card style={{ ...getCardTopStyle(isMobile), ...BLUE_LINEAR_GRADIENT }}>
                                <Typography>
                                    <Title level={isMobile ? 4 : 3}>
                                        Painel de notícias
                                    </Title>
                                    <Paragraph>
                                        Explore resumos criados por outros usuários ou crie o seu.
                                    </Paragraph>
                                    <Flex style={getActionButtonsStyle(isMobile)}>
                                        <Button
                                            type="primary"
                                            onClick={openCreateModal}
                                            style={getMobileButtonStyle(isMobile)}
                                        >
                                            Criar resumo
                                        </Button>
                                        <Link to="/summary" style={{ width: isMobile ? '100%' : 'auto' }}>
                                            <Button
                                                style={getMobileButtonStyle(isMobile)}
                                            >
                                                Explorar
                                            </Button>
                                        </Link>
                                    </Flex>
                                </Typography>
                            </Card>

                            <Title level={isMobile ? 3 : 1}>Avisos</Title>

                            {!news && (
                                <Flex justify="center" style={{ marginTop: '40px' }}>
                                    <Spin size="large" />
                                </Flex>
                            )}

                            {news?.data.data.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                                    Nenhuma notícia encontrada
                                </p>
                            )}

                            {news?.data.data.map((n: TNews) => (
                                <Card
                                    title={n.titulo}
                                    extra={
                                        <Avatar
                                            style={{ background: 'transparent' }}
                                            icon={
                                                <Image
                                                    loading="lazy"
                                                    preview={false}
                                                    src={logo}
                                                    alt="logo da plataforma"
                                                />
                                            }
                                        />
                                    }
                                    style={{ marginTop: '1.5vh' }}
                                    key={n.id}
                                >
                                    <LinkToCard texto={n.conteudo} />
                                </Card>
                            ))}

                            {news?.data.next_page_url && (
                                <Flex justify="center" style={{ marginTop: '1.5vh' }}>
                                    <Button
                                        type="primary"
                                        onClick={loadMoreNews}
                                        disabled={isLoadingMoreNews}
                                        style={getMobileButtonStyle(isMobile)}
                                    >
                                        Ver mais {isLoadingMoreNews && (
                                            <Spin indicator={<LoadingOutlined spin />} size="small" />
                                        )}
                                    </Button>
                                </Flex>
                            )}

                            {!news?.data.next_page_url && news?.data.data && news.data.data.length > 0 && (
                                <Layout style={{ width: '100%', background: 'transparent', marginTop: '1.5vh' }}>
                                    <Flex vertical align="center">
                                        <Typography>
                                            <Text style={{ fontWeight: 700, color: 'grey' }}>
                                                Parece que você chegou ao fim!
                                            </Text>
                                        </Typography>
                                        <Doodle
                                            customEyePosition="top"
                                            customMouthStyle="surprise"
                                            height={80}
                                            width={120}
                                        />
                                    </Flex>
                                </Layout>
                            )}
                        </Content>
                    </Layout>
                </Layout>

                {showSidebar && (
                    <Layout style={getContentSiderStyle(isMobile, isTablet || false)}>
                        <Layout style={{ overflow: 'hidden', height: '500px' }}>
                            <Card style={{ ...getMobileCardStyle(isMobile), background: 'white' }}>
                                {isLoadingLastSummaries ? (
                                    <div style={{
                                        display: 'flex',
                                        width: '100%',
                                        height: '100%',
                                        justifyContent: 'center',
                                        minHeight: '200px',
                                        alignItems: 'center'
                                    }}>
                                        <Spin size="large" />
                                    </div>
                                ) : (
                                    <>
                                        {lastSummaries && lastSummaries.length > 0 && (
                                            <>
                                                <Title
                                                    level={3}
                                                    style={{
                                                        placeSelf: 'center',
                                                        marginTop: '2vh',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Últimos resumos
                                                </Title>
                                                <Flex
                                                    vertical
                                                    className="home-carousel-wrapper"
                                                    style={{ width: '100%', height: '100%' }}
                                                    justify="center"
                                                >
                                                    <Carousel
                                                        autoplay
                                                        arrows
                                                        style={{ height: '100%' }}
                                                        draggable
                                                        autoplaySpeed={7000}
                                                    >
                                                        {lastSummaries.map((ls: any, index: number) => (
                                                            <div key={index}>
                                                                <CardSummary
                                                                    summaryData={ls}
                                                                    homePage={true}
                                                                />
                                                            </div>
                                                        ))}
                                                    </Carousel>
                                                </Flex>
                                            </>
                                        )}
                                    </>
                                )}

                                {!isLoadingLastSummaries && lastSummaries && lastSummaries.length < 1 && (
                                    <Layout style={{ width: '100%', background: 'transparent' }}>
                                        <Flex vertical align="center" style={{ padding: '40px 20px' }}>
                                            <Typography>
                                                <Text style={{ fontWeight: 700, color: 'grey' }}>
                                                    Ainda não há nada aqui
                                                </Text>
                                            </Typography>
                                            <Image
                                                loading="lazy"
                                                preview={false}
                                                src={doodleSideLookSmile}
                                                style={{
                                                    opacity: '.5',
                                                    width: '80px',
                                                    transform: 'scaleX(-1)',
                                                    margin: '20px 0'
                                                }}
                                            />
                                            <Button
                                                style={{
                                                    marginTop: '2vh',
                                                    ...getMobileButtonStyle(isMobile)
                                                }}
                                                type="primary"
                                                onClick={openCreateModal}
                                                icon={<PlusOutlined />}
                                                iconPosition="end"
                                            >
                                                Criar resumo
                                            </Button>
                                        </Flex>
                                    </Layout>
                                )}
                            </Card>
                        </Layout>
                    </Layout>
                )}
            </Layout>

            <UploadSummary
                isOpen={createModalIsOpen}
                onClose={closeUploadModal}
            />

            <ViewSummary
                id={summaryId}
                open={viewSummaryIdOpen}
                onClose={closeViewSummary}
                onlyDeletedContent={0}
            />

            <Modal
                open={isRulesModalOpen}
                width={isMobile ? '95%' : '80%'}
                onCancel={closeRulesModal}
                closable
                title="Regras da plataforma"
                styles={{
                    body: {
                        padding: 0,
                        maxHeight: '70vh',
                        overflow: 'hidden'
                    }
                }}
                footer={[
                    <Button key="close" type="primary" onClick={closeRulesModal}>
                        Fechar
                    </Button>
                ]}
            >
                <div style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    padding: isMobile ? '16px' : '24px'
                }}>
                    <Rules editing={false} />
                </div>
            </Modal>
        </>
    );
}