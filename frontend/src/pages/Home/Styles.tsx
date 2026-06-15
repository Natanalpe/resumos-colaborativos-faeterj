import type React from "react";

export const layoutStyle: React.CSSProperties = {
    overflow: 'hidden',
    width: '100%',
};

export const getContentLayoutStyle = (isMobile: boolean): React.CSSProperties => ({
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: 'transparent',
    flexDirection: isMobile ? 'column' : 'row',
    padding: isMobile ? '0' : '0 20px',
});

export const getContentNewsStyle = (showSidebar: boolean, isMobile: boolean): React.CSSProperties => ({
    flex: 1,
    width: '100%',
    padding: isMobile ? '8px' : '0 20px',
    maxWidth: isMobile ? '100%' : showSidebar ? '73%' : '1200px',
    margin: isMobile ? '0' : showSidebar ? '0' : '0 auto',
    boxSizing: 'border-box',
});

export const getContentSiderStyle = (isMobile: boolean, isTablet: boolean): React.CSSProperties => ({
    position: isMobile ? 'relative' : 'fixed',
    top: isMobile ? 'auto' : 0,
    right: isMobile ? 'auto' : 0,
    bottom: isMobile ? 'auto' : 0,
    width: isMobile ? '100%' : isTablet ? '30%' : '25%',
    padding: isMobile ? '16px' : '25px',
    overflow: 'auto',
    zIndex: 10,
    display: 'grid',
    gridTemplateRows: isMobile ? 'auto auto' : '40% 55%',
    gap: '20px',
    background: '#f1f1f1',
    minHeight: isMobile ? 'auto' : '100vh',
});

export const getCardTopStyle = (isMobile: boolean): React.CSSProperties => ({
    padding: isMobile ? '12px' : '2vh',
    marginBottom: isMobile ? '2vh' : '7vh',
    width: '100%',
    boxSizing: 'border-box',
});

export const getMobileCardStyle = (isMobile: boolean): React.CSSProperties => ({
    height: isMobile ? 'auto' : '100%',
    minHeight: isMobile ? '300px' : 'auto',
});

export const getActionButtonsStyle = (isMobile: boolean): React.CSSProperties => ({
    gap: isMobile ? '8px' : '2vh',
    marginTop: isMobile ? '12px' : '3vh',
    flexDirection: isMobile ? 'column' : 'row',
    width: '100%',
    display: 'flex',
});

export const getMobileButtonStyle = (isMobile: boolean): React.CSSProperties => ({
    width: isMobile ? '100%' : 'auto',
});

export const getTitleStyle = (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? '20px' : undefined,
    marginBottom: isMobile ? '16px' : '24px',
});

export const getNewsCardStyle = (isMobile: boolean): React.CSSProperties => ({
    marginTop: isMobile ? '12px' : '1.5vh',
    width: '100%',
    boxSizing: 'border-box',
});