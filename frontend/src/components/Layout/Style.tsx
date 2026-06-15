import type { CSSProperties } from "react";

export const mainLayoutStyle: CSSProperties = {
    minHeight: '100vh',
    height: '100%'
};

export const SiderMenuStyle: CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff'
};

export const getMainContentStyle = (isMobile: boolean): CSSProperties => ({
    marginLeft: isMobile ? 0 : 200,
    minHeight: '100vh',
    transition: 'margin-left 0.3s ease-in-out',
    padding: isMobile ? '60px 0 16px 0' : '24px',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
});

export const getSiderWrapperStyle = (isMobile: boolean): CSSProperties => ({
    ...SiderMenuStyle,
    zIndex: isMobile ? 100 : 1,
});