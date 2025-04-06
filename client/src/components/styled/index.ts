import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

// Global styles
export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: ${props => props.theme.colors.light};
    color: ${props => props.theme.colors.dark};
  }
  
  * {
    box-sizing: border-box;
  }
`;

// Common animations
export const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const blink = keyframes`
  0% { opacity: 0.1; }
  20% { opacity: 1; }
  100% { opacity: 0.1; }
`;

// Common styled components
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`;

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

// Button styles
export const ButtonBase = css`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled.button`
  ${ButtonBase}
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: 10px 16px;
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}e0`};
  }
`;

export const SecondaryButton = styled.button`
  ${ButtonBase}
  background-color: ${props => props.theme.colors.grayLight};
  color: ${props => props.theme.colors.dark};
  padding: 8px 14px;
  
  &:hover {
    background-color: ${props => props.theme.colors.grayMedium}20;
  }
`;

// Form elements
export const Input = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.grayLight};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}30`};
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.grayDark};
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

// Icon wrappers
export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
`;

export const RoundIcon = styled.div<{ size?: string; bg?: string; color?: string; fontSize?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
  background-color: ${props => props.bg || props.theme.colors.primary};
  color: ${props => props.color || 'white'};
  font-size: ${props => props.fontSize || 'inherit'};
`;
