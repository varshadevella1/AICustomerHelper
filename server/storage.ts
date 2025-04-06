import { users, User, InsertUser, Message, InsertMessage, Chat, InsertChat } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChatById(id: number): Promise<Chat | undefined>;
  getChatsByUserId(userId: number): Promise<Chat[]>;
  updateChatTitle(chatId: number, title: string): Promise<Chat>;
  updateChatLastMessage(chatId: number, message: string): Promise<Chat>;
  setActiveChatById(userId: number, chatId: number): Promise<void>;
  deactivateOtherChats(userId: number, activeChatId: number): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private userIdCounter: number;
  private chatIdCounter: number;
  private messageIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.userIdCounter = 1;
    this.chatIdCounter = 1;
    this.messageIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create initial chat for the user
    this.createChat({
      userId: id,
      title: "Welcome",
      lastMessage: "",
      lastMessageTime: new Date(),
      icon: "robot",
      active: true
    });
    
    return user;
  }
  
  // Chat methods
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.chatIdCounter++;
    const chat: Chat = { ...insertChat, id };
    this.chats.set(id, chat);
    return chat;
  }
  
  async getChatById(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }
  
  async updateChatTitle(chatId: number, title: string): Promise<Chat> {
    const chat = this.chats.get(chatId);
    if (!chat) throw new Error(`Chat with ID ${chatId} not found`);
    
    const updatedChat = { ...chat, title };
    this.chats.set(chatId, updatedChat);
    return updatedChat;
  }
  
  async updateChatLastMessage(chatId: number, message: string): Promise<Chat> {
    const chat = this.chats.get(chatId);
    if (!chat) throw new Error(`Chat with ID ${chatId} not found`);
    
    const updatedChat = { 
      ...chat, 
      lastMessage: message,
      lastMessageTime: new Date()
    };
    this.chats.set(chatId, updatedChat);
    return updatedChat;
  }
  
  async setActiveChatById(userId: number, chatId: number): Promise<void> {
    // Deactivate all user's chats
    await this.deactivateOtherChats(userId, chatId);
    
    // Activate the specified chat
    const chat = this.chats.get(chatId);
    if (chat && chat.userId === userId) {
      const updatedChat = { ...chat, active: true };
      this.chats.set(chatId, updatedChat);
    }
  }
  
  async deactivateOtherChats(userId: number, activeChatId: number): Promise<void> {
    for (const [id, chat] of this.chats.entries()) {
      if (chat.userId === userId && id !== activeChatId) {
        const updatedChat = { ...chat, active: false };
        this.chats.set(id, updatedChat);
      }
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
