import styled, { keyframes } from "styled-components";

const flexStyle: React.CSSProperties = {
  minHeight: '100vh',
};

const siderStyle: React.CSSProperties = {
  minHeight: '100vh',
  lineHeight: '120px',
  backgroundColor: '#0958d9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#f8f8f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
};

const inputStyle: React.CSSProperties = {
  maxWidth: '400px',
  height: '40px',
  borderRadius: '20px',
  width: '100%',
}

const buttonStyle: React.CSSProperties = {
  width: '200px',
  height: '40px',
  marginTop: '30px',
}

const formContainerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  padding: '0 20px',
}

interface SquareProps {
  rotateRight: boolean;
  delay: string;
}

const cicloAnimacao = (rotate: boolean) => keyframes`
  0% {
    transform: translateX(20px) scale(0.8);
    z-index: 1;
    opacity: 0.8;
  }
  2% {
    transform: translateX(-105%) scale(0.8) rotate(${rotate ? '90deg' : '-90deg'});
    z-index: 1;
    opacity: 0.8;
  }
  3% {
    z-index: 4; 
  }
  5% {
    transform: translateX(0) scale(1);
    z-index: 3;
    opacity: 1;
  }
  8% {
    transform: translateX(10px) scale(0.9);
    z-index: 2;
    opacity: 1;
  }
  100% {
    transform: translateX(20px) scale(0.8);
    z-index: 1;
    opacity: 1;
  }
`;

const Square = styled.div<SquareProps>`
  width: 450px;
  height: 450px;
  border-radius: 20px;
  position: absolute;

  animation-name: ${props => cicloAnimacao(props.rotateRight)};
  animation-duration: 12s;
  animation-timing-function: alternate;
  animation-iteration-count: infinite;
  animation-delay: ${props => props.delay};

  @media (max-width: 1200px) {
    width: 350px;
    height: 350px;
  }

  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
`;

const LoginBackgroundAnimation = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .r {
    animation-delay: -6s;
  }
  .g {
    background-color: #2ecc71;
    animation-delay: -3s;
  }
  .b {
    background-color: #3498db;
    animation-delay: 0s;
  }
`;

export {
  contentStyle,
  siderStyle,
  flexStyle,
  inputStyle,
  buttonStyle,
  formContainerStyle,
  LoginBackgroundAnimation,
  Square
};