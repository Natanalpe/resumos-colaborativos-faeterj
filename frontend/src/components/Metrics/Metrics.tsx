import { Flex, Grid, message, Spin } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import { useEffect } from "react";
import { getMetrics } from "../../service/SystemService";
import type { TQntSummaryBySubject, TResponseMetrics } from "../../types/SystemTypes";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import Title from "antd/es/typography/Title";
import { ResponsiveLine } from "@nivo/line";
import {
    metricsContainerStyle,
    getChartCardResponsiveStyle,
    getBarChartResponsiveStyle,
    chartTitleStyle,
    pieChartContainerStyle,
    barChartContainerStyle,
    lineChartContainerStyle,
    loadingContainerStyle,
    noDataContainerStyle
} from "./Style";
import { useQuery } from "@tanstack/react-query";

const { useBreakpoint } = Grid;

export type TMetrics = {
    administradores: number,
    alunos: number,
    professores: number,
    resumo_por_materia: TQntSummaryBySubject[],
    uploads_por_periodo: TUploadPorPeriodo[]
};

type TUploadPorPeriodo = {
    periodo: string,
    total: number
};

const useMetricsData = () => {
    return useQuery({
        queryKey: ['metrics'],
        queryFn: async () => {
            const response: TResponseMetrics = await getMetrics();
            return response.data.data.counts;
        },
        staleTime: 15 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
    });
};

const usePieChartData = (metricsData: TMetrics | undefined) => {
    if (!metricsData) return [];

    return [
        {
            id: 'professores',
            label: 'Professores',
            value: metricsData.professores,
            color: '#108ee9',
        },
        {
            id: 'alunos',
            label: 'Alunos',
            value: metricsData.alunos,
            color: '#b86ded',
        },
        {
            id: 'administradores',
            label: 'Administradores',
            value: metricsData.administradores,
            color: '#eb5656',
        }
    ];
};

export function Metrics() {
    const screens = useBreakpoint();
    const [messageApi, contextHolder] = message.useMessage();

    const {
        data: metricsData,
        isLoading,
        isError
    } = useMetricsData();

    const metricsGraphData = usePieChartData(metricsData);

    const isMobile = screens.xs && !screens.sm;
    const isTablet = (screens.sm || screens.md) && !screens.lg;
    const shouldStack = isMobile || isTablet;

    useEffect(() => {
        if (isError) {
            showMessage('Falha ao buscar métricas', 'error');
        }
    }, [isError]);

    const MyPie = () => {
        if (!metricsGraphData || metricsGraphData.length === 0) {
            return <div style={noDataContainerStyle}>Sem dados disponíveis</div>;
        }

        const colors = ['#108ee9', '#b86ded', '#eb5656'];
        
        let margins;
        if (isMobile) {
            margins = { top: 10, right: 20, bottom: 80, left: 20 };
        } else if (isTablet) {
            margins = { top: 15, right: 30, bottom: 70, left: 30 };
        } else {
            margins = { top: 20, right: 60, bottom: 60, left: 60 };
        }

        return (
            <div style={{
                ...pieChartContainerStyle,
                height: isMobile ? '320px' : isTablet ? '340px' : '380px'
            }}>
                <ResponsivePie
                    data={metricsGraphData}
                    margin={margins}
                    innerRadius={isMobile ? 0.4 : isTablet ? 0.45 : 0.5}
                    padAngle={1}
                    cornerRadius={isMobile ? 4 : 8}
                    activeOuterRadiusOffset={isMobile ? 4 : 8}
                    colors={colors}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['brighter', 10]] }}
                    enableArcLinkLabels={!isMobile && !isTablet}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: isMobile ? 'column' : isTablet ? 'row' : 'row',
                            translateY: isMobile ? 60 : isTablet ? 55 : 45,
                            itemWidth: isMobile ? 100 : isTablet ? 110 : 120,
                            itemHeight: 18,
                            symbolShape: 'circle',
                            itemsSpacing: isMobile ? 4 : 0
                        }
                    ]}
                />
            </div>
        );
    }

    const SubjectsBar = () => {
        if (!metricsData?.resumo_por_materia) {
            return <div style={noDataContainerStyle}>Sem dados disponíveis</div>;
        }

        let maxItems, maxNameLength;
        if (isMobile) {
            maxItems = 5;
            maxNameLength = 15;
        } else if (isTablet) {
            maxItems = 7;
            maxNameLength = 18;
        } else {
            maxItems = 10;
            maxNameLength = 30;
        }

        const barData = metricsData.resumo_por_materia
            .filter((item: any) => item.total_documentos > 0)
            .sort((a: any, b: any) => b.total_documentos - a.total_documentos)
            .slice(0, maxItems)
            .map((item: any) => {
                return {
                    materia: item.nome.length > maxNameLength ? item.nome.substring(0, maxNameLength - 3) + '...' : item.nome,
                    documentos: item.total_documentos,
                    materiaCompleta: item.nome
                };
            });

        let leftMargin, bottomMargin, rightMargin;
        if (isMobile) {
            leftMargin = 100;
            bottomMargin = 35;
            rightMargin = 20;
        } else if (isTablet) {
            leftMargin = 120;
            bottomMargin = 40;
            rightMargin = 25;
        } else {
            leftMargin = 200;
            bottomMargin = 50;
            rightMargin = 30;
        }

        const maxValue = Math.max(...barData.map((item: any) => item.documentos));
        const tickInterval = maxValue <= 10 ? 1 : Math.ceil(maxValue / 10);

        return (
            <div style={{
                ...barChartContainerStyle,
                minHeight: isMobile ? '280px' : isTablet ? '320px' : '380px'
            }}>
                <ResponsiveBar
                    data={barData}
                    keys={['documentos']}
                    indexBy="materia"
                    layout="horizontal"
                    margin={{ top: 20, right: rightMargin, bottom: bottomMargin, left: leftMargin }}
                    padding={isMobile ? 0.4 : isTablet ? 0.35 : 0.3}
                    valueScale={{ type: 'linear' }}
                    colors="#108ee9"
                    borderRadius={4}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: isMobile ? 'Resumos' : isTablet ? 'Resumos por matéria' : 'Quantidade de resumos por matéria',
                        legendPosition: 'middle',
                        legendOffset: bottomMargin - 5,
                        format: (value) => Math.round(value),
                        tickValues: maxValue <= 10 ? undefined : tickInterval
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    enableLabel={!isMobile}
                    tooltip={({ value, data }) => (
                        <div style={{
                            background: 'white',
                            padding: '9px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            maxWidth: '200px'
                        }}>
                            <strong style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {data.materiaCompleta}
                            </strong>
                            <br />
                            Resumos: {value}
                        </div>
                    )}
                />
            </div>
        );
    }

    const UploadsTimeline = () => {
        if (!metricsData?.uploads_por_periodo || metricsData.uploads_por_periodo.length === 0) {
            return <div style={noDataContainerStyle}>Sem dados disponíveis</div>;
        }

        const lineData = [{
            id: "uploads",
            data: metricsData.uploads_por_periodo.map((item: any) => {
                const [ano, mes] = item.periodo.split('-');
                const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                const mesFormatado = meses[parseInt(mes) - 1];

                return {
                    x: isMobile ? `${mesFormatado}` : `${mesFormatado}/${ano.slice(2)}`,
                    y: item.total
                };
            })
        }];

        let bottomMargin, leftMargin, rightMargin, tickRotation;
        if (isMobile) {
            bottomMargin = 50;
            leftMargin = 40;
            rightMargin = 15;
            tickRotation = -60;
        } else if (isTablet) {
            bottomMargin = 55;
            leftMargin = 50;
            rightMargin = 20;
            tickRotation = -50;
        } else {
            bottomMargin = 50;
            leftMargin = 60;
            rightMargin = 30;
            tickRotation = -45;
        }

        return (
            <div style={{
                ...lineChartContainerStyle,
                minHeight: isMobile ? '280px' : isTablet ? '300px' : '320px'
            }}>
                <ResponsiveLine
                    data={lineData}
                    margin={{ top: 20, right: rightMargin, bottom: bottomMargin, left: leftMargin }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 0,
                        max: 'auto',
                        stacked: false,
                        reverse: false
                    }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: tickRotation,
                        legend: isMobile ? '' : 'Período',
                        legendOffset: bottomMargin - 10,
                        legendPosition: 'middle'
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: isMobile ? '' : 'Uploads',
                        legendOffset: -50,
                        legendPosition: 'middle'
                    }}
                    enableGridX={false}
                    colors="#108ee9"
                    lineWidth={isMobile ? 2 : isTablet ? 2.5 : 3}
                    pointSize={isMobile ? 6 : isTablet ? 8 : 10}
                    pointColor="#108ee9"
                    pointBorderWidth={2}
                    pointBorderColor="#ffffff"
                    pointLabelYOffset={-12}
                    enableArea={true}
                    areaOpacity={0.1}
                    useMesh={true}
                    tooltip={({ point }) => (
                        <div style={{
                            background: 'white',
                            padding: '9px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: isMobile ? '12px' : '14px'
                        }}>
                            <strong>{point.data.xFormatted}</strong>
                            <br />
                            Uploads: {point.data.yFormatted}
                        </div>
                    )}
                />
            </div>
        );
    };

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        });
    }

    return (
        <>
            {contextHolder}
            <Flex
                wrap="wrap"
                style={{
                    ...metricsContainerStyle,
                    padding: isMobile ? '4px' : isTablet ? '6px' : '8px',
                    gap: isMobile ? '8px' : isTablet ? '12px' : '16px'
                }}
            >
                {isLoading ? (
                    <div style={loadingContainerStyle}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <Flex
                            vertical
                            style={{
                                ...getChartCardResponsiveStyle(!shouldStack),
                                flex: shouldStack ? '1 1 100%' : '1 1 calc(50% - 8px)',
                                maxWidth: shouldStack ? '100%' : 'calc(50% - 8px)',
                                minWidth: shouldStack ? '100%' : 'calc(50% - 8px)',
                                padding: isMobile ? '12px' : isTablet ? '14px' : '16px'
                            }}
                        >
                            <Title level={isMobile ? 5 : isTablet ? 4 : 3} style={chartTitleStyle}>
                                Usuários ativos
                            </Title>
                            <MyPie />
                        </Flex>

                        <Flex
                            vertical
                            style={{
                                ...getBarChartResponsiveStyle(!shouldStack),
                                flex: shouldStack ? '1 1 100%' : '1 1 calc(50% - 8px)',
                                maxWidth: shouldStack ? '100%' : 'calc(50% - 8px)',
                                minWidth: shouldStack ? '100%' : 'calc(50% - 8px)',
                                padding: isMobile ? '12px' : isTablet ? '14px' : '16px'
                            }}
                        >
                            <Title level={isMobile ? 5 : isTablet ? 4 : 3} style={chartTitleStyle}>
                                Resumos por matéria
                            </Title>
                            <SubjectsBar />
                        </Flex>

                        <Flex
                            vertical
                            style={{
                                ...getChartCardResponsiveStyle(!shouldStack),
                                flex: '1 1 100%',
                                width: '100%',
                                minWidth: '100%',
                                padding: isMobile ? '12px' : isTablet ? '14px' : '16px'
                            }}
                        >
                            <Title level={isMobile ? 5 : isTablet ? 4 : 3} style={chartTitleStyle}>
                                Atividade de uploads
                            </Title>
                            <UploadsTimeline />
                        </Flex>
                    </>
                )}
            </Flex>
        </>
    );
}