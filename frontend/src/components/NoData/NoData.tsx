import { Flex } from "antd"
import noData from '../../assets/images/noData.svg';

interface INoDataMessage {
    message: string,
    textSize?: string,
    textColor?: string,
    imageSize?: string,
    customStyle?: React.CSSProperties
}

export const NoData = ({ message, textSize = '16px', textColor = 'grey', imageSize = '50%', customStyle }: INoDataMessage) => {
    return (
        <Flex vertical align="center" justify="center" style={customStyle}>
            <img src={noData} style={{ width: imageSize }} />
            <p style={{ fontSize: textSize, color: textColor }}>{message}</p>
        </Flex>
    )
}