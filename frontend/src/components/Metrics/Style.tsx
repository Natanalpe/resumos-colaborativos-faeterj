export const metricsContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    gap: '16px',
    padding: '8px',
    overflow: 'auto'
};

export const chartCardStyle: React.CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #eeeeee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
};

export const chartTitleStyle: React.CSSProperties = {
    margin: 0,
    textAlign: 'center',
    width: '100%'
};

export const pieChartContainerStyle: React.CSSProperties = {
    height: '350px',
    width: '100%',
    maxWidth: '600px',
    minHeight: '280px'
};

export const barChartContainerStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    minHeight: '280px',
    flex: 1
};

export const lineChartContainerStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    minHeight: '280px',
    flex: 1
};

export const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: '400px'
};

export const noDataContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#999',
    fontSize: '14px',
    padding: '20px'
};

export const getChartCardResponsiveStyle = (isHorizontal: boolean): React.CSSProperties => ({
    ...chartCardStyle,
    flex: '1 1 400px',
    height: isHorizontal ? '100%' : 'auto',
    minHeight: 'fit-content'
});

export const getBarChartResponsiveStyle = (isHorizontal: boolean): React.CSSProperties => ({
    ...chartCardStyle,
    flex: '1 1 400px',
    height: isHorizontal ? '100%' : 'auto',
    overflow: 'auto',
    minHeight: 'fit-content'
});