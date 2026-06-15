import { Layout, Image, Flex, Typography, Card, Divider, Button, Tooltip, Tag, Popconfirm, message, Grid } from "antd";
import GCardBackground from '../../assets/images/GcarSummary.png'
import { useEffect, useMemo, useState } from "react";
import PCardBackground from '../../assets/images/PcarSummary.png'
import BCardBackground from '../../assets/images/BcarSummary.png'
import {
    CardSummaryLayoutStyle,
    DeleteOverlayButtonStyle,
    ImageOverlayTextStyle,
    ImageStyle,
    OverlayInnerTextStyle,
    OverlaySubjectOcronym,
    CardContentLayoutStyle,
    CardTitleStyle,
    CardImageContainerStyle
} from "./Style";
import Title from "antd/es/typography/Title";
import { DeleteOutlined, RetweetOutlined, RightOutlined } from "@ant-design/icons";
import { ViewSummary } from "../ViewSummary/ViewSummary";
import { useAuth } from "../../context/AuthContext";
import { admDeleteContent, deleteContentDocument, restoreSummary } from "../../service/DocumentsService";
import type { NoticeType } from "antd/es/message/interface";

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

type CardSummaryProps = {
    summaryData: any;
    onlyDeletedContent?: number;
    homePage?: boolean
}

export default function CardSummary({
    summaryData,
    onlyDeletedContent = 0,
    homePage = false
}: CardSummaryProps) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [canRestore, setCanRestore] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.lg;

    const [messageApi, contextHolder] = message.useMessage();

    const { user } = useAuth();

    const backgroundImage = useMemo(() => {
        const backgrounds = [GCardBackground, PCardBackground, BCardBackground];
        const hash = summaryData.id.toString().split('').reduce((acc: number, char: string) => {
            return acc + char.charCodeAt(0);
        }, 0);
        const index = hash % backgrounds.length;
        return backgrounds[index];
    }, [summaryData.id]);

    useEffect(() => {
        setCanRestore(location.href.includes("configurations/system"));
    }, []);

    const formatDate = (strDate: string) => {
        const date = new Date(strDate);

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    const openModal = () => {
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
    }

    const confirmDeletePost = () => {
        deleteContentDocument(summaryData.id)
            .then(() => {
                showMessage('Apagado com sucesso', 'success');
                window.location.reload();
            })
            .catch(() => {
                showMessage('Falha ao apagar', 'error');
            });
    }

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        });
    }

    const handleRestoreSummary = () => {
        restoreSummary(summaryData.id)
            .then(() => {
                showMessage('Restaurado com sucesso', 'success');
                window.location.reload();
            })
            .catch(() => {
                showMessage('Falha ao restaurar', 'error');
            });
    }

    const admDeleteSummary = () => {
        admDeleteContent(summaryData.id)
            .then(() => {
                showMessage('Apagado com sucesso', 'success');
                window.location.reload();
            })
            .catch(() => {
                showMessage('Falha ao apagado', 'success');
            });
    }

    return (
        <>
            {contextHolder}
            <Card style={CardSummaryLayoutStyle}>
                <Flex style={{ flexDirection: homePage || isMobile ? 'column' : 'row' }}>
                    <div style={CardImageContainerStyle(isMobile)}>
                        <Image
                            loading="lazy"
                            src={backgroundImage}
                            width='100%'
                            height='205px'
                            style={ImageStyle}
                            preview={false}
                            alt="card resumo"
                            aria-hidden={false}
                        />
                        <Tooltip title={summaryData.titulo}>
                            <Typography style={ImageOverlayTextStyle}>
                                <Paragraph style={OverlayInnerTextStyle(isMobile)}>
                                    {summaryData.titulo}
                                </Paragraph>
                            </Typography>
                        </Tooltip>
                        <Tooltip title={summaryData.subject.nome}>
                            <Tag style={OverlaySubjectOcronym} color="#1677ff">
                                {summaryData.subject.sigla}
                            </Tag>
                        </Tooltip>
                        <Flex style={DeleteOverlayButtonStyle}>
                            {(user?.role == 'administrador' || user?.user_id == summaryData.owner.id) && (
                                <Popconfirm
                                    title="Deseja deletar o post?"
                                    okText="Confirmar"
                                    cancelText="Cancelar"
                                    onConfirm={canRestore ? admDeleteSummary : confirmDeletePost}
                                >
                                    <Button icon={<DeleteOutlined />} danger />
                                </Popconfirm>
                            )}
                            {canRestore && user?.role == 'administrador' && (
                                <Popconfirm
                                    title="Deseja restaurar o post?"
                                    okText="Confirmar"
                                    cancelText="Cancelar"
                                    onConfirm={handleRestoreSummary}
                                >
                                    <Button icon={<RetweetOutlined />} style={{ color: '#36ff61', borderColor: '#36ff61' }} />
                                </Popconfirm>
                            )}
                        </Flex>
                    </div>
                    <Layout style={CardContentLayoutStyle(isMobile)}>
                        <Flex vertical>
                            {!homePage && (<Text>Resumo</Text>)}
                            <Typography>
                                <Tooltip title={summaryData.titulo}>
                                    <Title level={4} style={CardTitleStyle(isMobile)}>
                                        {summaryData.titulo}
                                    </Title>
                                </Tooltip>
                                <Paragraph>
                                    {summaryData.owner.role == 'aluno'
                                        ? <Tag color="#b86ded">{summaryData.owner.nome}</Tag>
                                        : <Tag color="#108ee9">Professor {summaryData.owner.nome}</Tag>
                                    }
                                    <Divider type="vertical" />
                                    {!homePage && (
                                        <>Publicado: {formatDate(summaryData.created_at)}</>
                                    )}
                                </Paragraph>
                            </Typography>
                        </Flex>
                        <Button
                            type="primary"
                            style={{ width: isMobile ? '100%' : '125px' }}
                            icon={<RightOutlined />}
                            iconPosition="end"
                            onClick={openModal}
                        >
                            Acessar
                        </Button>
                    </Layout>
                </Flex>
                {isModalOpen && (
                    <ViewSummary
                        open={isModalOpen}
                        onClose={closeModal}
                        id={summaryData.id}
                        onlyDeletedContent={onlyDeletedContent ?? 0}
                    />
                )}
            </Card>
        </>
    );
}
