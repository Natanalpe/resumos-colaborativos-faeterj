import React from 'react';

export const siderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    backgroundColor: '#ffffff',
    width: '100% !important',
    minHeight: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
};

export const logoStyle: React.CSSProperties = {
    width: '30%',
    minWidth: '60px',
    maxWidth: '120px',
}

export const menuStyle: React.CSSProperties = {
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
}

export const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
}

export const menuBottomStyle: React.CSSProperties = {
    bottom: '2vh',
    position: 'absolute',
    width: '100%'
}

export const getMenuItemStyle = (isSelected: boolean): React.CSSProperties => ({
    ...menuItemStyle,
    fontWeight: isSelected ? '700' : 'normal',
    backgroundColor: isSelected ? '#ddeaf5' : 'transparent',
    color: 'black'
});

export const getResponsiveSiderStyle = (isMobile: boolean, collapsed: boolean): React.CSSProperties => ({
    ...siderStyle,
    position: isMobile ? 'fixed' : 'fixed',
    transform: isMobile && !collapsed ? 'translateX(0)' : isMobile ? 'translateX(-100%)' : 'translateX(0)',
    transition: 'transform 0.3s ease-in-out',
    boxShadow: isMobile && !collapsed ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
});

export const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
};

export const menuButtonStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 101,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    border: '1px solid #d9d9d9',
    cursor: 'pointer',
};