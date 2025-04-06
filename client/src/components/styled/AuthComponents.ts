import styled from 'styled-components';
import { Card, FlexColumn, FlexRow, slideUp } from './index';

export const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${props => props.theme.colors.light};
  padding: 16px;
`;

export const AuthWrapper = styled.div`
  width: 100%;
  max-width: 400px;
`;

export const AuthTabs = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

export const AuthTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 12px;
  font-weight: 500;
  text-align: center;
  background: none;
  border: none;
  border-bottom: 2px solid;
  border-color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.grayLight};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.grayMedium};
  cursor: pointer;
  transition: all 0.2s ease;
`;

export const AuthCard = styled(Card)`
  animation: ${slideUp} 0.3s ease-out forwards;
`;

export const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

export const LogoCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
`;

export const AuthTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.dark};
`;

export const PasswordInputWrapper = styled.div`
  position: relative;
`;

export const PasswordToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.grayMedium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme.colors.grayDark};
  }
`;

export const FormHelper = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.grayMedium};
  margin-top: 4px;
`;

export const CheckboxContainer = styled(FlexRow)`
  align-items: center;
  margin-top: 4px;
`;

export const CheckboxLabel = styled.label`
  font-size: 14px;
  margin-left: 8px;
  color: ${props => props.theme.colors.grayDark};
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ActionRow = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const ForgotPasswordLink = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}e0`};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.grayMedium};
    cursor: not-allowed;
  }
`;
