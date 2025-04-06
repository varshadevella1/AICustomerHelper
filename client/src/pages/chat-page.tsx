import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat, Message } from '@/hooks/use-chat';
import {
  FaBars, FaRobot, FaPaperPlane, FaPaperclip, FaBell, FaCog, 
  FaSignOutAlt, FaCommentDots, FaQuestionCircle, FaLightbulb, FaPlus
} from 'react-icons/fa';
import {
  ChatContainer,
  Sidebar,
  SidebarHeader,
  SidebarTitle,
  SidebarContent,
  SidebarSection,
  SidebarSectionTitle,
  ChatItem,
  ChatItemIcon,
  ChatItemContent,
  ChatItemTitle,
  ChatItemSubtitle,
  NewChatButton,
  SidebarFooter,
  UserProfile,
  UserInfo,
  UserAvatar,
  UserDetails,
  UserName,
  UserEmail,
  LogoutButton,
  MobileSidebarOverlay,
  MobileSidebar,
  MainContent,
  ChatHeader,
  ChatHeaderLeft,
  MobileMenuButton,
  ChatTitle,
  StatusIndicator,
  StatusDot,
  ChatHeaderRight,
  IconButton,
  ChatMessagesContainer,
  WelcomeCard,
  WelcomeIconWrapper,
  WelcomeTitle,
  WelcomeText,
  SuggestedQuestionsContainer,
  SuggestedQuestion,
  MessageGroup,
  MessageAvatar,
  MessageContent,
  MessageText,
  MessageTime,
  TypingIndicator,
  TypingDots,
  TypingDot,
  MessageInputContainer,
  MessageForm,
  AttachmentButton,
  MessageInputWrapper,
  MessageInput,
  SendButton
} from '@/components/styled/ChatComponents';
import { RoundIcon } from '@/components/styled/index';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { messages, chats, activeChat, isTyping, sendMessage, createNewChat, selectChat } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessageInput(question);
    // Optional: auto-send the question
    sendMessage(question);
    setMessageInput('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIconForChat = (icon: string) => {
    switch (icon) {
      case 'comment':
        return <FaCommentDots />;
      case 'question':
        return <FaQuestionCircle />;
      case 'lightbulb':
        return <FaLightbulb />;
      default:
        return <FaRobot />;
    }
  };

  const getColorForChat = (index: number) => {
    const colors = ['#6c63ff', '#ff9d00', '#4a6ee0'];
    return colors[index % colors.length];
  };

  const getUserInitial = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : '';
  };

  return (
    <ChatContainer>
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <RoundIcon size="40px">
            <FaRobot />
          </RoundIcon>
          <SidebarTitle>AI Support</SidebarTitle>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarSection>
            <SidebarSectionTitle>Chats</SidebarSectionTitle>
            
            {chats.map((chat, index) => (
              <ChatItem 
                key={chat.id}
                active={chat.id === activeChat?.id}
                onClick={() => selectChat(chat.id)}
              >
                <ChatItemIcon color={getColorForChat(index)}>
                  {getIconForChat(chat.icon)}
                </ChatItemIcon>
                <ChatItemContent>
                  <ChatItemTitle>{chat.title}</ChatItemTitle>
                  <ChatItemSubtitle>
                    Last message: {chat.lastMessage 
                      ? `${chat.lastMessage.substring(0, 20)}${chat.lastMessage.length > 20 ? '...' : ''}`
                      : formatTime(chat.lastMessageTime)
                    }
                  </ChatItemSubtitle>
                </ChatItemContent>
              </ChatItem>
            ))}
            
            <NewChatButton onClick={createNewChat}>
              <FaPlus />
              <span style={{ marginLeft: '8px' }}>New Conversation</span>
            </NewChatButton>
          </SidebarSection>
        </SidebarContent>
        
        <SidebarFooter>
          <UserProfile>
            <UserInfo>
              <UserAvatar>
                {getUserInitial(user?.username || '')}
              </UserAvatar>
              <UserDetails>
                <UserName>{user?.username}</UserName>
                <UserEmail>User ID: {user?.id}</UserEmail>
              </UserDetails>
            </UserInfo>
            <LogoutButton onClick={logout}>
              <FaSignOutAlt />
            </LogoutButton>
          </UserProfile>
        </SidebarFooter>
      </Sidebar>
      
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <MobileSidebarOverlay onClick={() => setShowMobileSidebar(false)}>
          <MobileSidebar onClick={(e) => e.stopPropagation()}>
            {/* Clone of the sidebar content for mobile */}
            <SidebarHeader>
              <RoundIcon size="40px">
                <FaRobot />
              </RoundIcon>
              <SidebarTitle>AI Support</SidebarTitle>
            </SidebarHeader>
            
            <SidebarContent>
              <SidebarSection>
                <SidebarSectionTitle>Chats</SidebarSectionTitle>
                
                {chats.map((chat, index) => (
                  <ChatItem 
                    key={chat.id}
                    active={chat.id === activeChat?.id}
                    onClick={() => {
                      selectChat(chat.id);
                      setShowMobileSidebar(false);
                    }}
                  >
                    <ChatItemIcon color={getColorForChat(index)}>
                      {getIconForChat(chat.icon)}
                    </ChatItemIcon>
                    <ChatItemContent>
                      <ChatItemTitle>{chat.title}</ChatItemTitle>
                      <ChatItemSubtitle>
                        Last message: {chat.lastMessage 
                          ? `${chat.lastMessage.substring(0, 20)}${chat.lastMessage.length > 20 ? '...' : ''}`
                          : formatTime(chat.lastMessageTime)
                        }
                      </ChatItemSubtitle>
                    </ChatItemContent>
                  </ChatItem>
                ))}
                
                <NewChatButton onClick={() => {
                  createNewChat();
                  setShowMobileSidebar(false);
                }}>
                  <FaPlus />
                  <span style={{ marginLeft: '8px' }}>New Conversation</span>
                </NewChatButton>
              </SidebarSection>
            </SidebarContent>
            
            <SidebarFooter>
              <UserProfile>
                <UserInfo>
                  <UserAvatar>
                    {getUserInitial(user?.username || '')}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user?.username}</UserName>
                    <UserEmail>User ID: {user?.id}</UserEmail>
                  </UserDetails>
                </UserInfo>
                <LogoutButton onClick={logout}>
                  <FaSignOutAlt />
                </LogoutButton>
              </UserProfile>
            </SidebarFooter>
          </MobileSidebar>
        </MobileSidebarOverlay>
      )}
      
      {/* Main Content */}
      <MainContent>
        {/* Chat Header */}
        <ChatHeader>
          <ChatHeaderLeft>
            <MobileMenuButton onClick={() => setShowMobileSidebar(true)}>
              <FaBars />
            </MobileMenuButton>
            <ChatTitle>{activeChat?.title || 'AI Support'}</ChatTitle>
            <StatusIndicator>
              <StatusDot />
              Active
            </StatusIndicator>
          </ChatHeaderLeft>
          
          <ChatHeaderRight>
            <IconButton>
              <FaBell />
            </IconButton>
            <IconButton>
              <FaCog />
            </IconButton>
          </ChatHeaderRight>
        </ChatHeader>
        
        {/* Chat Messages */}
        <ChatMessagesContainer>
          {/* Welcome Message - show if no messages */}
          {messages.length === 0 && (
            <WelcomeCard>
              <WelcomeIconWrapper>
                <FaRobot style={{ fontSize: '24px', color: '#4a6ee0' }} />
              </WelcomeIconWrapper>
              <WelcomeTitle>AI Support Assistant</WelcomeTitle>
              <WelcomeText>
                I'm here to help with your questions about billing, account setup, or feature requests. How can I assist you today?
              </WelcomeText>
              <SuggestedQuestionsContainer>
                <SuggestedQuestion onClick={() => handleSuggestedQuestion('How do I update billing?')}>
                  How do I update billing?
                </SuggestedQuestion>
                <SuggestedQuestion onClick={() => handleSuggestedQuestion('Change subscription')}>
                  Change subscription
                </SuggestedQuestion>
                <SuggestedQuestion onClick={() => handleSuggestedQuestion('Payment failed')}>
                  Payment failed
                </SuggestedQuestion>
              </SuggestedQuestionsContainer>
            </WelcomeCard>
          )}
          
          {/* Message list */}
          {messages.map((message: Message) => (
            <MessageGroup key={message.id} sender={message.sender}>
              {message.sender === 'bot' && (
                <MessageAvatar>
                  <FaRobot style={{ fontSize: '12px' }} />
                </MessageAvatar>
              )}
              
              {message.sender === 'user' && (
                <MessageTime sender={message.sender}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              )}
              
              <MessageContent sender={message.sender}>
                <MessageText sender={message.sender}>{message.content}</MessageText>
              </MessageContent>
              
              {message.sender === 'bot' && (
                <MessageTime sender={message.sender}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              )}
            </MessageGroup>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <TypingIndicator>
              <MessageAvatar>
                <FaRobot style={{ fontSize: '12px' }} />
              </MessageAvatar>
              <TypingDots>
                <TypingDot />
                <TypingDot />
                <TypingDot />
              </TypingDots>
            </TypingIndicator>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </ChatMessagesContainer>
        
        {/* Message Input */}
        <MessageInputContainer>
          <MessageForm onSubmit={handleSendMessage}>
            <AttachmentButton type="button">
              <FaPaperclip />
            </AttachmentButton>
            <MessageInputWrapper>
              <MessageInput
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
            </MessageInputWrapper>
            <SendButton type="submit" disabled={!messageInput.trim() || !activeChat}>
              <FaPaperPlane style={{ fontSize: '14px' }} />
            </SendButton>
          </MessageForm>
        </MessageInputContainer>
      </MainContent>
    </ChatContainer>
  );
}
