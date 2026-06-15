export const flexLayoutStyle: React.CSSProperties = {
    width: '100%',
    padding: '2vh',
    gap: '2vh',
};

export const tableStyle: React.CSSProperties = {
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
};

export const searchBarStyle: React.CSSProperties = {
    flex: '1 1 100%'
};

export const roleSelectStyle: React.CSSProperties = {
    flex: '1 1 20%'
};

export const formEditUserStudentStyle: React.CSSProperties = {
    marginTop: '2vh'
};

export const dropDownFilterStyle: React.CSSProperties = {
    background: 'white',
    boxShadow: "5px 5px 9px 1px rgba(0, 0, 0, 0.1)",
    borderRadius: '7px'
};

export const modalWarningsStyle: React.CSSProperties = {
    width: '90vh'
};

export const drawerResponseCreateUsersStyle: React.CSSProperties = {
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
};

export const formRowStyle = (isMobile: boolean): React.CSSProperties => ({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1vh',
});

export const searchStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1vh'
};
