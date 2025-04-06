import styled from 'styled-components';
import { FlexColumn, FlexRow, slideInLeft, slideUp, blink } from './index';

// Layout components
export const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

// Sidebar components
export const Sidebar = styled.aside`
  width: 280px;
  background-color: white;
  border-right: 1px solid ${props => props.theme.colors.grayLight};
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.grayLight};
  display: flex;
  align-items: center;
`;

export const SidebarTitle = styled.h1`
  margin-left: 12px;
  font-size: 18px;
  font-weight: bold;
`;

export const SidebarContent = styled.div`
  padding: 16px 8px;
  flex: 1;
  overflow-y: auto;
`;

export const SidebarSection = styled.div`
  margin-bottom: 8px;
`;

export const SidebarSectionTitle = styled.h2`
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  color: ${props => props.theme.colors.grayDark};
  letter-spacing: 0.05em;
  padding: 0 8px;
  margin-bottom: 8px;
`;

export const ChatItem = styled.button<{ active?: boolean }>`
  width: 100%;
  text-align: left;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.active ? props.theme.colors.grayLight : 'transparent'};
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.grayLight};
  }
`;

export const ChatItemIcon = styled.div<{ color?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.color || props.theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

export const ChatItemContent = styled.div`
  margin-left: 12px;
  overflow: hidden;
`;

export const ChatItemTitle = styled.p`
  font-weight: 500;
  color: ${props => props.theme.colors.dark};
  margin: 0;
`;

export const ChatItemSubtitle = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.grayMedium};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NewChatButton = styled(ChatItem)`
  color: ${props => props.theme.colors.primary};
`;

export const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.theme.colors.grayLight};
`;

export const UserProfile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.grayMedium};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
`;

export const UserDetails = styled.div`
  margin-left: 12px;
`;

export const UserName = styled.p`
  font-weight: 500;
  color: ${props => props.theme.colors.dark};
  margin: 0;
`;

export const UserEmail = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.grayMedium};
  margin: 0;
`;

export const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.grayDark};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.danger};
    background-color: ${props => props.theme.colors.grayLight};
  }
`;

// Mobile sidebar
export const MobileSidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: block;
  }
`;

export const MobileSidebar = styled.div`
  background-color: white;
  height: 100%;
  width: 80%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  animation: ${slideInLeft} 0.3s ease-out forwards;
`;

// Main chat components
export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${props => props.theme.colors.light};
`;

export const ChatHeader = styled.header`
  background-color: white;
  border-bottom: 1px solid ${props => props.theme.colors.grayLight};
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ChatHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const MobileMenuButton = styled.button`
  display: none;
  padding: 8px;
  margin-right: 8px;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.grayDark};
  border-radius: 50%;
  cursor: pointer;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.grayLight};
  }
`;

export const ChatTitle = styled.h2`
  font-weight: 600;
  margin: 0;
`;

export const StatusIndicator = styled.span`
  margin-left: 8px;
  padding: 4px 8px;
  background-color: #e6f7e9;
  color: ${props => props.theme.colors.success};
  border-radius: 12px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
`;

export const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.success};
  margin-right: 4px;
`;

export const ChatHeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

export const IconButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.grayDark};
  border-radius: 50%;
  margin-left: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.grayLight};
    color: ${props => props.color || props.theme.colors.grayDark};
  }
`;

// Chat messages area
export const ChatMessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const WelcomeCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  margin: 16px auto 32px;
`;

export const WelcomeIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${props => `${props.theme.colors.primary}1a`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

export const WelcomeTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const WelcomeText = styled.p`
  color: ${props => props.theme.colors.grayDark};
  margin-bottom: 16px;
`;

export const SuggestedQuestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

export const SuggestedQuestion = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.theme.colors.grayLight};
  border: none;
  border-radius: 16px;
  font-size: 14px;
  color: ${props => props.theme.colors.dark};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => `${props.theme.colors.grayMedium}20`};
  }
`;

// Message components
export const MessageGroup = styled.div<{ sender: 'user' | 'bot' }>`
  display: flex;
  margin-bottom: 16px;
  max-width: 90%;
  animation: ${slideUp} 0.3s ease-out forwards;
  
  ${props => props.sender === 'user' && `
    margin-left: auto;
    justify-content: flex-end;
  `}
`;

export const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  align-self: flex-end;
`;

export const MessageContent = styled.div<{ sender: 'user' | 'bot' }>`
  position: relative;
  border-radius: ${props => 
    props.sender === 'user' 
      ? '16px 16px 0 16px' 
      : '16px 16px 16px 0'
  };
  background-color: ${props => 
    props.sender === 'user' 
      ? props.theme.colors.primary 
      : 'white'
  };
  padding: 12px;
  margin: ${props => 
    props.sender === 'user' 
      ? '0 0 0 12px' 
      : '0 12px 0 8px'
  };
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

export const MessageText = styled.p<{ sender: 'user' | 'bot' }>`
  margin: 0;
  color: ${props => 
    props.sender === 'user' 
      ? 'white' 
      : props.theme.colors.grayDark
  };
`;

export const MessageTime = styled.span<{ sender: 'user' | 'bot' }>`
  font-size: 12px;
  color: ${props => props.theme.colors.grayMedium};
  align-self: flex-end;
  margin: ${props => 
    props.sender === 'user' 
      ? '0 8px 0 0' 
      : '0 0 0 8px'
  };
`;

// Typing indicator
export const TypingIndicator = styled.div`
  display: flex;
  margin-bottom: 16px;
  max-width: 90%;
`;

export const TypingDots = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 16px 16px 16px 0;
  padding: 12px 16px;
  margin: 0 12px 0 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

export const TypingDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.grayMedium};
  margin: 0 2px;
  animation: ${blink} 1.4s infinite both;
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

// Message input area
export const MessageInputContainer = styled.div`
  background-color: white;
  border-top: 1px solid ${props => props.theme.colors.grayLight};
  padding: 16px;
`;

export const MessageForm = styled.form`
  display: flex;
  align-items: center;
`;

export const AttachmentButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.grayMedium};
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme.colors.grayDark};
  }
`;

export const MessageInputWrapper = styled.div`
  flex: 1;
  margin: 0 8px;
  position: relative;
`;

export const MessageInput = styled.input`
  width: 100%;
  border: 1px solid ${props => props.theme.colors.grayLight};
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}30`};
  }
`;

export const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}e0`};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.grayMedium};
    cursor: not-allowed;
  }
`;
