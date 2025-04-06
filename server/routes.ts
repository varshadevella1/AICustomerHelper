import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateAIResponse, generateChatTitle } from "./openai";

// Keep track of connected clients
const clients = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on("connection", async (ws, req) => {
    // Get session and user from the request
    const userId = await getUserIdFromSession(req);
    
    if (!userId) {
      ws.close(1008, "Authentication required");
      return;
    }
    
    // Store client connection
    clients.set(userId, ws);
    
    console.log(`WebSocket connected: User ${userId}`);
    
    // Send initial chats to client
    const userChats = await storage.getChatsByUserId(userId);
    ws.send(JSON.stringify({
      type: "chats",
      chats: userChats,
    }));
    
    // Handle WebSocket messages
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case "message":
            await handleChatMessage(userId, data, ws);
            break;
            
          case "getChats":
            const chats = await storage.getChatsByUserId(userId);
            ws.send(JSON.stringify({
              type: "chats",
              chats,
            }));
            break;
            
          case "getMessages":
            const messages = await storage.getMessagesByChatId(data.chatId);
            ws.send(JSON.stringify({
              type: "messages",
              chatId: data.chatId,
              messages,
            }));
            break;
            
          case "createChat":
            const newChat = await storage.createChat({
              userId,
              title: "New Conversation",
              lastMessage: "",
              lastMessageTime: new Date(),
              icon: "comment",
              active: true,
            });
            
            // Mark other chats as inactive
            await storage.deactivateOtherChats(userId, newChat.id);
            
            // Send updated chat list
            const updatedChats = await storage.getChatsByUserId(userId);
            ws.send(JSON.stringify({
              type: "chats",
              chats: updatedChats,
            }));
            break;
            
          case "selectChat":
            await storage.setActiveChatById(userId, data.chatId);
            const chatMessages = await storage.getMessagesByChatId(data.chatId);
            
            ws.send(JSON.stringify({
              type: "messages",
              chatId: data.chatId,
              messages: chatMessages,
            }));
            break;
            
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
    
    // Handle disconnection
    ws.on("close", () => {
      clients.delete(userId);
      console.log(`WebSocket disconnected: User ${userId}`);
    });
  });

  // API route for getting all chats
  app.get("/api/chats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const chats = await storage.getChatsByUserId(req.user!.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  // API route for getting chat messages
  app.get("/api/chats/:chatId/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const chatId = parseInt(req.params.chatId);
      const chat = await storage.getChatById(chatId);
      
      if (!chat || chat.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  return httpServer;
}

async function getUserIdFromSession(req: any): Promise<number | null> {
  try {
    // This is a simplified version - in a real app, you'd parse the session from cookies
    // and validate against your session store
    if (req.session?.passport?.user) {
      return req.session.passport.user;
    }
    return null;
  } catch (error) {
    console.error("Error extracting user from session:", error);
    return null;
  }
}

async function handleChatMessage(userId: number, data: any, ws: WebSocket) {
  try {
    // Get the chat
    const chat = await storage.getChatById(data.chatId);
    
    if (!chat || chat.userId !== userId) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Chat not found or access denied",
      }));
      return;
    }
    
    // Save user message
    const userMessage = await storage.createMessage({
      chatId: chat.id,
      content: data.content,
      sender: "user",
      timestamp: new Date(),
    });
    
    // If this is the first message, generate a better title
    if (chat.lastMessage === "") {
      const newTitle = await generateChatTitle(data.content);
      await storage.updateChatTitle(chat.id, newTitle);
      
      // Send updated chat list
      const updatedChats = await storage.getChatsByUserId(userId);
      ws.send(JSON.stringify({
        type: "chats",
        chats: updatedChats,
      }));
    }
    
    // Update chat lastMessage
    await storage.updateChatLastMessage(chat.id, data.content);
    
    // Get chat history for AI context
    const chatHistory = await storage.getMessagesByChatId(chat.id);
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));
    
    // Send typing indicator
    ws.send(JSON.stringify({
      type: "typing",
      isTyping: true,
    }));
    
    // Generate AI response
    const aiResponse = await generateAIResponse(data.content, formattedHistory);
    
    // Simulate typing delay for more natural interaction
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Save bot message
    await storage.createMessage({
      chatId: chat.id,
      content: aiResponse,
      sender: "bot",
      timestamp: new Date(),
    });
    
    // Update chat lastMessage again
    await storage.updateChatLastMessage(chat.id, aiResponse);
    
    // Send bot response
    ws.send(JSON.stringify({
      type: "botResponse",
      content: aiResponse,
    }));
    
    // Send typing indicator off
    ws.send(JSON.stringify({
      type: "typing",
      isTyping: false,
    }));
  } catch (error) {
    console.error("Error handling chat message:", error);
    ws.send(JSON.stringify({
      type: "error",
      message: "Failed to process your message",
    }));
  }
}
