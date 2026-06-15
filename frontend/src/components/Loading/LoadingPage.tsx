import { Layout, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import { ContentStyle, LoadingPageStyle } from "./Style";

export default function LoadingPage() {
    return (
        <Layout style={LoadingPageStyle}>
            <Content style={ContentStyle}>
                <Spin size="large"/>
            </Content>
        </Layout>
    );
}