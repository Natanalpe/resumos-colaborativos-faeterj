import Layout from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import Title from "antd/es/typography/Title";
import { useDebounce } from "../../../hooks/UseDebouce";
import { searchNews } from "../../../service/NewsService";
import { cardNewsStyle, flexLayoutStyle, newsContainerStyle, searchBarStyle, searchStyle } from "./Styles";
import type { NoticeType } from "antd/es/message/interface";
import { BLUE_LINEAR_GRADIENT } from "../../../Global/Styles";
import type { TNews } from "../../../types/News";
import { Button, Card, DatePicker, Divider, Flex, Form, Grid, Input, message, Pagination, Spin, Tooltip, type DatePickerProps } from "antd";
import { ClearOutlined, EditOutlined, InfoCircleFilled, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { LinkToCard } from "../../../components/LinkCard/LinkCard";
import { EditViewNews, type TNewsPropsData } from "./EditModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const { useBreakpoint } = Grid;

interface PaginatedNewsResponse {
    current_page: number;
    data: TNews[];
    per_page: number;
    total: number;
    last_page: number;
};

export default function NewsDashboard() {

    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = (screens.md && !screens.lg) || false;
    const isSmallMobile = !screens.sm;

    const { debounce } = useDebounce();
    const [searchTerm, setSearchTerm] = useState<string | any>('');
    const [isDateSearch, setIsDateSearch] = useState<boolean>();
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [page, setPage] = useState<number>(1);

    const [newsData, setNewsData] = useState<TNewsPropsData>();
    const [isModalAddOpen, setIsModalAddOpen] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reloadNews, setReloadNews] = useState(false);

    const [form] = Form.useForm();

    useEffect(() => {
        debounce(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        });
    }, [searchTerm, debounce]);

    const fetchNews = async (search: string, page: number) => {
        try {
            const response = await searchNews(search, page, isDateSearch);
            return response.data.data;
        } catch (error) {
            showError("Falha ao carregar notícias", "error");
        }
    }

    const { data: news, isFetching } = useQuery<PaginatedNewsResponse>({
        queryKey: ['news', page, debouncedSearchTerm],
        queryFn: () => fetchNews(debouncedSearchTerm, page),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const showError = (content: string, type: NoticeType) => {
        messageApi.open({
            type: type,
            content: content,
            duration: 3
        });
        message.config({ rtl: false });
    }

    const initialValuesNews: TNewsPropsData = {
        id: '',
        conteudo: '',
        titulo: '',
    };

    const openModal = (newsData: TNewsPropsData, isEditModal: boolean) => {
        if (isEditModal) {
            setNewsData(newsData);
            setIsModalOpen(true);
        } else {
            setNewsData(initialValuesNews);
            setIsModalAddOpen(true);
        }

    }

    const closeModal = (_: boolean = true, shouldReloadNews: boolean = false) => {

        if (isModalAddOpen) {
            setIsModalAddOpen(false)
        } else {
            setIsModalOpen(false);
            setNewsData(undefined);
        }

        if (shouldReloadNews) {
            setReloadNews(!reloadNews);
            setPage(1);
        }
    }

    const formatDate = (date: string | Date) => {
        const d = new Date(date);

        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'UTC'
        }).format(d);
    }

    const onChangeDatePicker: DatePickerProps['onChange'] = (date) => {
        let fDate = date.format('DD/MM/YYYY');
        form.setFieldsValue({
            date: date,
            query: ''
        });
        setIsDateSearch(true);
        setSearchTerm(fDate);
    }

    const onChangeStringSearch = (term: string) => {
        form.setFieldsValue({
            date: '',
            query: term
        });
        setIsDateSearch(false);
        setSearchTerm(term);
    }

    const clearFields = () => {
        setSearchTerm('');
        setIsDateSearch(false);
        form.resetFields();
    }

    return (
        <>
            {contextHolder}
            < Layout >
                <Flex vertical style={flexLayoutStyle(isMobile, isSmallMobile)}>
                    <Card style={{
                        ...BLUE_LINEAR_GRADIENT,
                        height: isMobile ? '80px' : '125px',
                        padding: isMobile ? '12px' : '24px'
                    }}>
                        <Title
                            level={isMobile ? 3 : 1}
                            style={{
                                fontSize: isSmallMobile ? '20px' : isMobile ? '24px' : '32px',
                                margin: 0
                            }}
                        >
                            Painel de notícias
                        </Title>
                    </Card>
                    <Card style={{ padding: isMobile ? '12px' : '24px' }}>
                        <Flex vertical justify="center" align="end">
                            <Button
                                disabled={isModalOpen || isModalAddOpen}
                                onClick={() => openModal(initialValuesNews, false)}
                                type="primary"
                                style={{ width: isMobile ? '100%' : '120px' }}
                                icon={<PlusOutlined />}
                                size={isMobile ? 'middle' : 'middle'}
                            >
                                {isMobile ? 'Nova' : 'Nova notícia'}
                            </Button>
                            <Divider style={{ margin: isMobile ? '12px 0' : '16px 0' }} />
                            <Form form={form} style={searchStyle(isMobile, isSmallMobile)}>
                                <Form.Item name="query" style={searchBarStyle}>
                                    <Input
                                        placeholder={isSmallMobile ? "Buscar" : "Buscar notícia"}
                                        prefix={<SearchOutlined />}
                                        suffix={
                                            !isSmallMobile && (
                                                <Tooltip title="É possível pesquisar por titulo, palavras-chave e data (Ex. Maio, 05, 2025, 08, 01/01/2025, 01-01-2025).">
                                                    <InfoCircleFilled style={{ color: 'rgba(0,0,0,.45)' }} />
                                                </Tooltip>
                                            )
                                        }
                                        value={searchTerm}
                                        onChange={(e) => onChangeStringSearch(e.target.value)}
                                        size={isMobile ? 'middle' : 'middle'}
                                    />
                                </Form.Item>
                                <Form.Item name="date" style={{ margin: 0 }}>
                                    <DatePicker
                                        onChange={onChangeDatePicker}
                                        format='DD/MM/YYYY'
                                        placeholder="Data"
                                        style={{ width: 'auto' }}
                                        size='middle'
                                    />
                                </Form.Item>
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={clearFields}
                                    style={{ maxWidth: '90px' }}
                                >
                                    {!isSmallMobile && 'Limpar'}
                                </Button>
                            </Form>
                            <Layout style={newsContainerStyle(isMobile, isTablet, isSmallMobile)}>
                                {isFetching && page === 1 ? (
                                    <Spin size="large" />
                                ) : news?.data.length === 0 ? (
                                    <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                                        Nenhuma notícia encontrada
                                    </p>
                                ) : (
                                    news?.data.map((n: TNews) => (
                                        <Card
                                            key={n.id}
                                            style={cardNewsStyle(isMobile, isSmallMobile)}
                                            title={
                                                <span style={{
                                                    fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '18px',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {n.titulo}
                                                </span>
                                            }
                                            extra={
                                                <Flex style={{
                                                    gap: isMobile ? '1vh' : '2vh',
                                                    alignItems: 'baseline',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <Title
                                                        level={5}
                                                        style={{
                                                            fontSize: isSmallMobile ? '11px' : isMobile ? '12px' : '14px',
                                                            margin: 0,
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {formatDate(n.created_at)}
                                                    </Title>
                                                    <Tooltip title="Editar notícia">
                                                        <Button
                                                            disabled={isFetching || isModalAddOpen || isModalOpen}
                                                            shape="circle"
                                                            icon={<EditOutlined />}
                                                            onClick={() => openModal({
                                                                id: n.id,
                                                                conteudo: n.conteudo,
                                                                titulo: n.titulo
                                                            }, true)}
                                                            size={isMobile ? 'small' : 'middle'}
                                                        />
                                                    </Tooltip>
                                                </Flex>
                                            }
                                        >
                                            <LinkToCard
                                                texto={n.conteudo}
                                                fixedSize
                                            />
                                        </Card>
                                    ))
                                )}
                            </Layout>
                        </Flex>
                        {news && news.total > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: isMobile ? 'center' : 'flex-end',
                                marginTop: '16px'
                            }}>
                                <Pagination
                                    current={page}
                                    pageSize={news.per_page}
                                    total={news.total}
                                    onChange={(newPage) => setPage(newPage)}
                                    disabled={isFetching}
                                    showSizeChanger={false}
                                    size={isMobile ? 'small' : 'default'}
                                    simple={isSmallMobile}
                                />
                            </div>
                        )}
                    </Card>
                </Flex >
                {isModalOpen && (
                    <EditViewNews
                        isEditing={true}
                        newsData={newsData}
                        isOpen={isModalOpen}
                        onClose={(success, reload) => {
                            closeModal(success, reload);
                            if (reload) {
                                queryClient.invalidateQueries({ queryKey: ['news'] });
                            }
                        }}
                    />
                )
                }

                {
                    isModalAddOpen && (
                        <EditViewNews
                            isEditing={false}
                            newsData={newsData}
                            isOpen={isModalAddOpen}
                            onClose={(success, reload) => {
                                closeModal(success, reload);
                                if (reload) {
                                    queryClient.invalidateQueries({ queryKey: ['news'] });
                                }
                            }}
                        />
                    )
                }
            </Layout >
        </>
    );
}