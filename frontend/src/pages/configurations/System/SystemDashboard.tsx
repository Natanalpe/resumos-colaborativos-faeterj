import { Card, Flex, Tabs } from "antd";
import Layout from "antd/es/layout/layout";
import { BLUE_LINEAR_GRADIENT } from "../../../Global/Styles";
import Title from "antd/es/typography/Title";
import { ConfMetricsStyle, flexLayoutStyle } from "./Style";
import type { TabsProps } from "antd/lib";
import { FileExclamationOutlined, FileProtectOutlined, PieChartOutlined, WarningOutlined } from "@ant-design/icons";
import Rules from "../../../components/Rules/Rules";
import { Maintenance } from "../../../components/Maintenance/Maintenance";
import { Metrics } from "../../../components/Metrics/Metrics";
import DeletedSummaries from "../../../components/DeletedSummaries/DeletedSummaries";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";

export default function SystemDashboard() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [tabSelected, setTabSelected] = useState('1');

    const tabItems: TabsProps['items'] = [
        { key: '1', label: 'Métricas', icon: <PieChartOutlined />, children: <Metrics /> },
        { key: '2', label: 'Politicas e regras', icon: <FileProtectOutlined />, children: <Rules editing /> },
        { key: '3', label: 'Manutenção', icon: <WarningOutlined />, children: <Maintenance /> },
        { key: '4', label: 'Resumos removidos', icon: <FileExclamationOutlined />, children: <DeletedSummaries /> },
    ];

    useEffect(() => {
        const tab = searchParams.get('tab') || '1';
        setTabSelected(tab);
    }, []);

    useEffect(() => {
        setSearchParams({ tab: tabSelected });
    }, [tabSelected]);

    return (
        <Layout style={{ padding: '0' }} >
            <Flex vertical style={flexLayoutStyle}>
                <Card style={BLUE_LINEAR_GRADIENT}>
                    <Title>Configurações e métricas</Title>
                </Card>
                <Card style={ConfMetricsStyle}>
                    <Tabs
                        defaultActiveKey="1"
                        items={tabItems}
                        style={{
                            overflow: 'auto'
                        }}
                        tabBarStyle={{ flex: '0 0 auto' }}
                        className="full-height-tabs"
                        onChange={setTabSelected}
                        activeKey={tabSelected}
                    />
                </Card>
            </Flex>
        </Layout>
    );
}
