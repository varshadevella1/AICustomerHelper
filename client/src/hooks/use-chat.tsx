import { createContext, ReactNode, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './use-auth';

// Define message types
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: Date;
  icon: string;
  active: boolean;
}

type ChatContextType = {
  messages: Message[];
  chats: Chat[];
  activeChat: Chat | null;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      socket.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        // Clear any reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'botResponse') {
          setIsTyping(false);
          addMessage({
            id: Date.now().toString(),
            content: data.content,
            sender: 'bot',
            timestamp: new Date(),
          });
        } else if (data.type === 'typing') {
          setIsTyping(data.isTyping);
        } else if (data.type === 'chats') {
          setChats(data.chats);
          if (data.chats.length > 0 && !activeChat) {
            const active = data.chats.find((chat: Chat) => chat.active);
            setActiveChat(active || data.chats[0]);
          }
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        // Attempt to reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    connectWebSocket();

    // Clean up on unmount
    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  // Load initial chats when user logs in
  useEffect(() => {
    if (user && socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ type: 'getChats' }));
    }
  }, [user, socket.current?.readyState]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat && socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ 
        type: 'getMessages', 
        chatId: activeChat.id 
      }));
    }
  }, [activeChat]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Update the last message in the chat
    if (activeChat) {
      setChats(prev => 
        prev.map(chat => 
          chat.id === activeChat.id 
            ? { ...chat, lastMessage: message.content, lastMessageTime: message.timestamp }
            : chat
        )
      );
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || !activeChat || !socket.current) return;
    
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    addMessage(message);
    
    // Send message to server
    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        type: 'message',
        chatId: activeChat.id,
        content,
      }));
      
      setIsTyping(true);
    } else {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createNewChat = () => {
    if (!socket.current) return;
    
    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        type: 'createChat',
      }));
    } else {
      toast({
        title: "Connection Error",
        description: "Unable to create a new chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectChat = (chatId: string) => {
    const selected = chats.find(chat => chat.id === chatId);
    if (selected) {
      setActiveChat(selected);
      setMessages([]); // Clear messages from previous chat
      
      // Update active status
      setChats(prev => 
        prev.map(chat => ({
          ...chat,
          active: chat.id === chatId
        }))
      );
      
      // Inform server about chat selection
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
          type: 'selectChat',
          chatId,
        }));
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        chats,
        activeChat,
        isTyping,
        sendMessage,
        createNewChat,
        selectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
