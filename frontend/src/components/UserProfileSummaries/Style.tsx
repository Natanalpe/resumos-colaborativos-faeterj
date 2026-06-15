export const flexLayoutStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '2vh',
    gap: '2vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
};

export const tableStyle: React.CSSProperties = {
    height: '100%',
    overflow: 'auto'
};

export const formStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2vh'
};


export const searchBarStyle: React.CSSProperties = {
    flex: '1 1 100%'
};

export const materiaSelectStyle: React.CSSProperties = {
    flex: '1 1 20%',
};

export const typeSelectStyle: React.CSSProperties = {
    flex: '1 1 15%'
};

export const teacherSelectStyle: React.CSSProperties = {
    flex: '1 1 20%'
};


export const formRowStyle = (isMobile: boolean): React.CSSProperties => ({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1vh',
    alignItems: 'end'
});

export const clearFieldsButtonStyle = (isMobile: boolean): React.CSSProperties => ({
    flex: isMobile ? '1 1 100%' : '0 0 auto',
    width: isMobile ? '100%' : 'auto',
    minWidth: isMobile ? 'auto' : '50px'
});

export const formItemStyle = (isMobile: boolean): React.CSSProperties => ({
    marginBottom: 0,
    width: isMobile ? '100%' : 'auto'
});
