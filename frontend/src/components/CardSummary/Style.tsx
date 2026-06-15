import type { CSSProperties } from "react";

export const CardSummaryLayoutStyle: CSSProperties = {
    border: 'none',
};

export const ImageStyle: CSSProperties = {
    objectFit: 'cover',
    borderRadius: '11px',
    display: 'block',
    width: '100%',
    height: '205px'
};

export const ImageOverlayTextStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(1, 1, 1, .25)',
    borderRadius: '99px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    height: '50px',
};

export const OverlayInnerTextStyle = (isMobile: boolean): CSSProperties => ({
    color: 'white',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    maxWidth: isMobile ? '100%' : '190px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '13px',
    padding: '0 10px'
});

export const OverlaySubjectOcronym: CSSProperties = {
    position: 'absolute',
    right: '8px',
    bottom: '8px',
    fontWeight: 700
};

export const DeleteOverlayButtonStyle: CSSProperties = {
    position: 'absolute',
    left: '8px',
    top: '8px',
    gap: '5px'
};

export const CardContentLayoutStyle = (isMobile: boolean): CSSProperties => ({
    padding: '1vh',
    background: 'transparent',
    width: isMobile ? '100%' : 'auto',
    display: 'flex',
    justifyContent: 'space-between'
});

export const CardTitleStyle = (isMobile: boolean): CSSProperties => ({
    maxWidth: isMobile ? '100%' : '300px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

export const CardDescriptionStyle = (isMobile: boolean): CSSProperties => ({
    width: isMobile ? '100%' : '300px'
});

export const CardImageContainerStyle = (isMobile: boolean): CSSProperties => ({
    width: isMobile ? '100%' : '300px',
    height: '205px',
    position: 'relative',
    display: 'block',
    flexShrink: 0
});