import { Button, Card, Flex, Layout } from "antd";
import { RegisterEmailForm } from "../../components/RegisterEmailForm/RegisterEmailForm";
import { Link } from "react-router";
import { LeftOutlined } from "@ant-design/icons";

export function RegisterEmail() {
    return (
        <>
            <Layout style={{ width: '100%', height: '100vh', position: 'relative' }}>
                <Button type="link" style={{position: 'absolute', left: '2vh', top: '2vh'}} icon={<LeftOutlined />}><Link to={'/login'}>Voltar</Link></Button>
                <Flex vertical style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Card title="Cadastre um email">
                        <RegisterEmailForm size="450px" />
                    </Card>
                </Flex>
            </Layout>
        </>
    );
}