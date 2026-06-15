import React from 'react';

export const flexLayoutStyle = (isMobile: boolean, isSmallMobile: boolean): React.CSSProperties => ({
    width: '100%',
    padding: isSmallMobile ? '1vh' : isMobile ? '1.5vh' : '2vh',
    gap: isSmallMobile ? '1vh' : isMobile ? '1.5vh' : '2vh',
});

export const searchStyle = (isMobile: boolean, isSmallMobile: boolean): React.CSSProperties => ({
    width: '100%',
    display: 'flex',
    gap: isSmallMobile ? '0.5vh' : isMobile ? '0.8vh' : '1vh',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    alignItems: 'flex-start'
});

export const searchBarStyle: React.CSSProperties = {
    flex: '1 1 100%',
    margin: 0
};

export const cardNewsStyle = (isMobile: boolean, isSmallMobile: boolean): React.CSSProperties => ({
    border: '1px solid #dddddd',
    flex: 'auto',
    minWidth: 'auto',
    width: '100%',
    fontSize: isSmallMobile ? '13px' : isMobile ? '14px' : '16px'
});

export const newsContainerStyle = (isMobile: boolean, isTablet: boolean, isSmallMobile: boolean): React.CSSProperties => {
    let minCardWidth = '550px';
    
    if (isSmallMobile) {
        minCardWidth = '100%';
    } else if (isMobile) {
        minCardWidth = '100%';
    } else if (isTablet) {
        minCardWidth = '400px';
    }

    return {
        width: '100%',
        padding: isSmallMobile ? '0.5vh' : isMobile ? '0.8vh' : '1vh',
        gap: isSmallMobile ? '1vh' : isMobile ? '1.5vh' : '2vh',
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`,
        backgroundColor: 'white',
    };
};