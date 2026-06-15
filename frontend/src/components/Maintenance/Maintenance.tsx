import { useEffect, useState } from "react";
import { getMaintenanceMode, updateMaintenanceMode } from "../../service/SystemService";
import Title from "antd/es/typography/Title";
import { Button, ConfigProvider, DatePicker, Divider, Flex, message, Popconfirm, Space, Spin, Typography } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import ptBR from 'antd/es/locale/pt_BR';
import pt from 'antd/es/date-picker/locale/pt_BR';
import dayjs from "dayjs";

const { Text } = Typography

interface IMaintenanceResponse {
    created_at: string,
    updated_at: string,
    previsao_fim: string,
    em_manutencao: boolean | number
};

export function Maintenance() {

    const [maintenanceData, setMaintenanceData] = useState<IMaintenanceResponse>({ created_at: '0', em_manutencao: 0, previsao_fim: '0', updated_at: '0' });
    const [estimateEnd, setEstimateEnd] = useState<string>('2025-10-19 01:10:40');
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const BRLocale: typeof pt = {
        ...pt,
        lang: {
            ...pt.lang,
            fieldDateFormat: 'DD-MM-YYYY',
            fieldDateTimeFormat: 'DD-MM-YYYY HH:mm',
            yearFormat: 'YYYY',
            cellYearFormat: 'YYYY',
        },
    };

    const globalBRLocale: typeof ptBR = {
        ...ptBR,
        DatePicker: {
            ...ptBR.DatePicker!,
            lang: BRLocale.lang,
        },
    };

    const now = dayjs();

    useEffect(() => {
        loadMaintenanceMode();
    }, []);

    const loadMaintenanceMode = () => {
        setLoading(true);
        getMaintenanceMode()
            .then((response) => {
                setMaintenanceData(response.data.data);
                setLoading(false);
            })
            .catch(() => {
                showMessage("Falha ao carregar dados da manutenção", "error");
                setLoading(false);
            });
    }

    const changeMaintenanceMode = () => {
        setIsFetching(true);
        updateMaintenanceMode(!maintenanceData.em_manutencao, estimateEnd)
            .then(() => {
                showMessage(`Modo de manutenção ${maintenanceData.em_manutencao ? 'desativado' : 'ativado'}`, 'success');
                maintenanceData.em_manutencao = !maintenanceData.em_manutencao;
            })
            .catch(() => {
                showMessage(`Falha ao ${maintenanceData.em_manutencao ? 'desativar' : 'ativar'} modo manutenção`, 'error');
            })
            .finally(() => {
                setIsFetching(false);
            });
    }

    const showMessage = (msg: string, type: NoticeType) => {
        messageApi.open({
            content: msg,
            type: type
        });
    }

    const handleSetEstimated = (date: dayjs.Dayjs | null) => {
        if (date) {
            const formattedDate = date.format('YYYY-MM-DD HH:mm');
            setEstimateEnd(formattedDate);
        }
    }

    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current < dayjs().startOf('day');
    };

    const disabledTime = (date: dayjs.Dayjs | null) => {
        if (!date || !date.isSame(dayjs(), 'day')) {
            return {};
        }

        const currentHour = dayjs().hour();
        const currentMinute = dayjs().minute();

        return {
            disabledHours: () => {
                return Array.from({ length: currentHour }, (_, i) => i);
            },
            disabledMinutes: (selectedHour: number) => {
                if (selectedHour === currentHour) {
                    return Array.from({ length: currentMinute }, (_, i) => i);
                }
                return [];
            },
        };
    };

    return (
        <>
            {contextHolder}
            <Flex vertical style={{ height: '100%', justifyContent: 'center', alignItems: 'center', padding: '2vh', gap: '15px', marginTop: '2vh' }}>
                {loading ? (
                    <>
                        <Spin size="large" />
                    </>
                ) : (
                    <>
                        <Typography style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Title level={4}>{maintenanceData.em_manutencao == 1 ? 'Desativar' : 'Ativar'} modo de manutenção</Title>
                            <Text style={{ textAlign: 'center' }} type="secondary">Ao ativar o modo de manutenção, todos os usuários, exceto Administradores, não poderão acessar a plataforma e todas as suas credenciais (tokens de acesso) serão revogados.</Text>
                            <br />
                            <Text style={{ textAlign: 'center' }} type="secondary">O estado de manutenção devera ser desativado manualmente nesta mesma página.</Text>
                        </Typography>
                        <Divider />
                        <ConfigProvider locale={globalBRLocale}>
                            <Text>Selecione abaixo quando a manutenção será finalizada</Text>
                            <Space direction="vertical">
                                <DatePicker
                                    defaultValue={now}
                                    showTime
                                    onChange={handleSetEstimated}
                                    disabledDate={disabledDate}
                                    disabledTime={disabledTime}
                                    format="DD/MM/YYYY HH:mm"
                                    showNow={false}
                                    allowClear={false}
                                />
                            </Space>
                        </ConfigProvider>

                        <Popconfirm
                            title="Confirmar"
                            okText="Confirmar"
                            cancelText="Cancelar"
                            onConfirm={changeMaintenanceMode}
                        >
                            <Button disabled={isFetching} type="primary" style={{ background: maintenanceData.em_manutencao ? '#52c41a' : '#ff4d4f', border: 'none', fontWeight: '400' }}>{maintenanceData.em_manutencao ? 'Desativar' : 'Ativar'} modo manutenção</Button>
                        </Popconfirm>
                    </>
                )
                }
            </Flex >
        </>
    );
}