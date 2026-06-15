import { Card, Grid } from "antd";
import React, { type JSX } from "react";

const { useBreakpoint } = Grid;

interface LinkCardProps {
    url: string;
}

interface TextProps {
    texto: string;
    fixedSize?: boolean
}

const customMenuStyles = `
    .link-card-custom .ant-card-body {
        padding: 4px 10px !important;
        display: inline-flex;
        width: auto;
        max-width: 100%;
    }
`;

const getCardStyle = (isMobile: boolean, isSmallMobile: boolean): React.CSSProperties => ({
    width: 'auto',
    maxWidth: '100%',
    height: 'auto',
    minHeight: isMobile ? '32px' : '28px',
    backgroundColor: '#f0f2f5',
    cursor: 'pointer',
    borderRadius: '3px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
    margin: isSmallMobile ? '2px 4px 2px 0' : isMobile ? '2px 6px 2px 0' : '2px 8px 2px 0',
    verticalAlign: 'middle',
    overflow: 'hidden',
});

const contentCardStyle = (isSmallMobile: boolean): React.CSSProperties => ({
    width: isSmallMobile ? 16 : 18,
    height: isSmallMobile ? 16 : 18,
    backgroundColor: '#1890ff',
    borderRadius: 4,
    marginRight: isSmallMobile ? 6 : 8,
    color: 'white',
    fontWeight: 'bold',
    fontSize: isSmallMobile ? 10 : 12,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
});

const flexAlignCenterStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
}

const LinkCard = ({ url }: LinkCardProps) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;

    const getDomainName = () => {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            const domain = urlObj.hostname;
            const cleanDomain = domain.replace('www.', '').replace(/,/g, '');
            
            let maxLength = 40;
            if (isSmallMobile) {
                maxLength = 20;
            } else if (isMobile) {
                maxLength = 25;
            }
            
            return cleanDomain.length > maxLength ? `${cleanDomain.substring(0, maxLength)}...` : cleanDomain;
        } catch {
            let maxLength = 40;
            if (isSmallMobile) {
                maxLength = 20;
            } else if (isMobile) {
                maxLength = 25;
            }
            
            const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
            return cleanUrl.length > maxLength ? `${cleanUrl.substring(0, maxLength)}...` : cleanUrl;
        }
    };

    const domainName = getDomainName();
    const firstLetter = domainName.charAt(0).toUpperCase();

    return (
        <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
                display: 'inline-block',
                maxWidth: '100%',
                verticalAlign: 'middle'
            }}
        >
            <style>{customMenuStyles}</style>
            <Card 
                size="small" 
                className="link-card-custom"
                style={getCardStyle(isMobile, isSmallMobile)}
            >
                <div style={flexAlignCenterStyle}>
                    <div style={contentCardStyle(isSmallMobile)}>
                        {firstLetter}
                    </div>
                    <div style={{ 
                        fontWeight: 400, 
                        fontSize: isSmallMobile ? 12 : isMobile ? 13 : 14, 
                        color: '#1890ff', 
                        textDecoration: 'underline',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: isSmallMobile ? '150px' : isMobile ? '180px' : '250px'
                    }}>
                        {domainName}
                    </div>
                </div>
            </Card>
        </a>
    );
};

const TextWithLinkCards = ({ text }: { text: string }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;
    
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;

    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    text.replace(urlRegex, (match, ...args) => {
        const index = args[args.length - 2];

        if (index > lastIndex) {
            const textPart = text.substring(lastIndex, index);
            parts.push(textPart);
        }

        parts.push(<LinkCard key={`link-${index}-${match}`} url={match} />);

        lastIndex = index + match.length;
        return match;
    });

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return (
        <div style={{ 
            textAlign: 'justify', 
            padding: isSmallMobile ? '4px' : isMobile ? '8px' : '12px',
            lineHeight: isMobile ? '1.8' : '1.6',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {parts.map((part, i) => (
                <React.Fragment key={`part-${i}`}>{part}</React.Fragment>
            ))}
        </div>
    );
};

const LinkToCard: React.FC<TextProps> = ({ texto, fixedSize = false }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;
    
    return (
        <div style={{ 
            lineHeight: isMobile ? '1.8' : '1.6',
            minHeight: isSmallMobile ? '60px' : isMobile ? '80px' : '100px', 
            maxHeight: fixedSize ? (isSmallMobile ? '100px' : isMobile ? '120px' : '100px') : 'auto', 
            overflow: fixedSize ? 'auto' : 'visible',
            fontSize: isSmallMobile ? '13px' : isMobile ? '14px' : '16px',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden'
        }}>
            <TextWithLinkCards text={texto} />
        </div>
    );
}

export { LinkToCard };