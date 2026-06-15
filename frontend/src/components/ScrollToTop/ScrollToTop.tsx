import { FloatButton } from 'antd';
import { UpOutlined } from '@ant-design/icons';

export function ScrollToTop() {
    return (
        <FloatButton.BackTop
            icon={<UpOutlined />}
            tooltip="Voltar ao topo"
            visibilityHeight={200}
            style={{
                right: 12,
                bottom: 12,
            }}
        />
    );
}