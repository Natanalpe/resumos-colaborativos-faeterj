import type { CSSProperties } from "react";

export const getFlexLayoutStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '2vh',
    gap: '2vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
};

export const tableStyle: CSSProperties = {
    height: '100%',
    overflow: 'auto'
};

export const formStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2vh'
};

export const formRowStyle = (isMobile: boolean): CSSProperties => ({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1vh',
    alignItems: 'end'
});

export const searchBarStyle: CSSProperties = {
    flex: '1 1 100%',
    minWidth: '200px'
};

export const clearFieldsButtonStyle = (isMobile: boolean): CSSProperties => ({
    flex: isMobile ? '1 1 100%' : '0 0 auto',
    width: isMobile ? '100%' : 'auto',
    minWidth: isMobile ? 'auto' : '50px'
});

export const formItemStyle = (isMobile: boolean): CSSProperties => ({
    marginBottom: 0,
    width: isMobile ? '100%' : 'auto'
});

export const labelStyle: CSSProperties = {
    marginBottom: '8px',
    display: 'block',
    fontWeight: 'bold',
    fontSize: '14px'
};