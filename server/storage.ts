import session from "express-session";
import createMemoryStore from "memorystore";
import { User, Chat, Message } from "./db";
import { Types } from "mongoose";

// @ts-ignore - Type error with memorystore but it works in practice
const MemoryStore = createMemoryStore(session);

// Helper to convert MongoDB ObjectId to string
const toStringId = (id: Types.ObjectId) => id.toString();

// Global variable to track if MongoDB is available
let isMongoDBAvailable = false;

// Function to set MongoDB availability status
export function setMongoDBAvailability(available: boolean) {
  isMongoDBAvailable = available;
  console.log(`MongoDB availability set to: ${available}`);
}

// Define types for our schema to match what was expected by the previous code
export type User = {
  id: number;
  username: string;
  password: string;
};

export type Chat = {
  id: number;
  userId: number;
  title: string;
  lastMessage: string;
  lastMessageTime: Date;
  icon: string;
  active: boolean;
};

export type Message = {
  id: number;
  chatId: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export type InsertUser = Omit<User, 'id'>;
export type InsertChat = Omit<Chat, 'id'>;
export type InsertMessage = Omit<Message, 'id'>;

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
  sessionStore: any;
}

export class MongoDBStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // Helper to convert MongoDB document to our User type
  private mapUser(user: any): User {
    return {
      id: parseInt(user._id.toString().substring(0, 8), 16),
      username: user.username,
      password: user.password
    };
  }

  // Helper to convert MongoDB document to our Chat type
  private mapChat(chat: any): Chat {
    return {
      id: parseInt(chat._id.toString().substring(0, 8), 16),
      userId: parseInt(chat.userId.toString().substring(0, 8), 16),
      title: chat.title,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.createdAt,
      icon: chat.icon,
      active: chat.active
    };
  }

  // Helper to convert MongoDB document to our Message type
  private mapMessage(message: any): Message {
    return {
      id: parseInt(message._id.toString().substring(0, 8), 16),
      chatId: parseInt(message.chatId.toString().substring(0, 8), 16),
      content: message.content,
      sender: message.sender,
      timestamp: message.createdAt
    };
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Since we don't have a direct way to lookup by our custom id,
      // we'll fetch all users and find the matching one
      const users = await User.find();
      const user = users.find(u => parseInt(u._id.toString().substring(0, 8), 16) === id);
      return user ? this.mapUser(user) : undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? this.mapUser(user) : undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = await User.create(insertUser);
      
      // Create initial chat for the user
      await this.createChat({
        userId: parseInt(newUser._id.toString().substring(0, 8), 16),
        title: "Welcome",
        lastMessage: "",
        lastMessageTime: new Date(),
        icon: "robot",
        active: true
      });
      
      return this.mapUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Chat methods
  async createChat(insertChat: InsertChat): Promise<Chat> {
    try {
      // Find the MongoDB ObjectId for the user
      const users = await User.find();
      const user = users.find(u => parseInt(u._id.toString().substring(0, 8), 16) === insertChat.userId);
      
      if (!user) {
        throw new Error(`User with ID ${insertChat.userId} not found`);
      }
      
      const newChat = await Chat.create({
        userId: user._id,
        title: insertChat.title,
        lastMessage: insertChat.lastMessage,
        icon: insertChat.icon,
        active: insertChat.active
      });
      
      return this.mapChat(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }
  
  async getChatById(id: number): Promise<Chat | undefined> {
    try {
      // Since we don't have a direct way to lookup by our custom id,
      // we'll fetch all chats and find the matching one
      const chats = await Chat.find();
      const chat = chats.find(c => parseInt(c._id.toString().substring(0, 8), 16) === id);
      return chat ? this.mapChat(chat) : undefined;
    } catch (error) {
      console.error('Error fetching chat:', error);
      return undefined;
    }
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    try {
      // Find the MongoDB ObjectId for the user
      const users = await User.find();
      const user = users.find(u => parseInt(u._id.toString().substring(0, 8), 16) === userId);
      
      if (!user) {
        return [];
      }
      
      const chats = await Chat.find({ userId: user._id });
      return chats
        .map(chat => this.mapChat(chat))
        .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    } catch (error) {
      console.error('Error fetching chats by user ID:', error);
      return [];
    }
  }
  
  async updateChatTitle(chatId: number, title: string): Promise<Chat> {
    try {
      // Find the chat by our custom ID
      const chats = await Chat.find();
      const chat = chats.find(c => parseInt(c._id.toString().substring(0, 8), 16) === chatId);
      
      if (!chat) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }
      
      chat.title = title;
      await chat.save();
      
      return this.mapChat(chat);
    } catch (error) {
      console.error('Error updating chat title:', error);
      throw error;
    }
  }
  
  async updateChatLastMessage(chatId: number, message: string): Promise<Chat> {
    try {
      // Find the chat by our custom ID
      const chats = await Chat.find();
      const chat = chats.find(c => parseInt(c._id.toString().substring(0, 8), 16) === chatId);
      
      if (!chat) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }
      
      chat.lastMessage = message;
      await chat.save();
      
      return this.mapChat(chat);
    } catch (error) {
      console.error('Error updating chat last message:', error);
      throw error;
    }
  }
  
  async setActiveChatById(userId: number, chatId: number): Promise<void> {
    try {
      // Deactivate all other chats for this user
      await this.deactivateOtherChats(userId, chatId);
      
      // Find the chat by our custom ID
      const chats = await Chat.find();
      const chat = chats.find(c => parseInt(c._id.toString().substring(0, 8), 16) === chatId);
      
      if (!chat) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }
      
      // Make sure the chat belongs to the user
      const users = await User.find();
      const user = users.find(u => parseInt(u._id.toString().substring(0, 8), 16) === userId);
      
      if (!user || !chat.userId.equals(user._id)) {
        throw new Error(`Chat with ID ${chatId} does not belong to user with ID ${userId}`);
      }
      
      chat.active = true;
      await chat.save();
    } catch (error) {
      console.error('Error setting active chat:', error);
      throw error;
    }
  }
  
  async deactivateOtherChats(userId: number, activeChatId: number): Promise<void> {
    try {
      // Find the MongoDB ObjectId for the user
      const users = await User.find();
      const user = users.find(u => parseInt(u._id.toString().substring(0, 8), 16) === userId);
      
      if (!user) {
        return;
      }
      
      // Get all chats for the user
      const userChats = await Chat.find({ userId: user._id });
      
      // Deactivate all chats except the active one
      for (const chat of userChats) {
        if (parseInt(chat._id.toString().substring(0, 8), 16) !== activeChatId) {
          chat.active = false;
          await chat.save();
        }
      }
    } catch (error) {
      console.error('Error deactivating other chats:', error);
      throw error;
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      // Find the chat by our custom ID
      const chats = await Chat.find();
      const chat = chats.find(c => parseInt(c._id.toString().substring(0, 8), 16) === insertMessage.chatId);
      
      if (!chat) {
        throw new Error(`Chat with ID ${insertMessage.chatId} not found`);
      }
      
      const newMessage = await Message.create({
        chatId: chat._id,
        content: insertMessage.content,
        sender: insertMessage.sender
      });
      
      // Update the chat's last message
      chat.lastMessage = insertMessage.content;
      await chat.save();
      
      return this.mapMessage(newMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }
  
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    try {
      // Find the chat by our custom ID
      const chats = await Chat.find();
      const chat = chats.find(c => parseInt(c._id.toString().substring(0, 8), 16) === chatId);
      
      if (!chat) {
        return [];
      }
      
      const messages = await Message.find({ chatId: chat._id });
      return messages
        .map(message => this.mapMessage(message))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching messages by chat ID:', error);
      return [];
    }
  }
}

// In-memory fallback storage
export class MemStorage implements IStorage {
  sessionStore: any;
  private users: User[] = [];
  private chats: Chat[] = [];
  private messages: Message[] = [];
  private nextUserId = 1;
  private nextChatId = 1;
  private nextMessageId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    console.log('Using in-memory storage');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser
    };
    this.users.push(user);

    // Create initial chat for the user
    await this.createChat({
      userId: user.id,
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
    const chat: Chat = {
      id: this.nextChatId++,
      ...insertChat
    };
    this.chats.push(chat);
    return chat;
  }

  async getChatById(id: number): Promise<Chat | undefined> {
    return this.chats.find(c => c.id === id);
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return this.chats
      .filter(c => c.userId === userId)
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }

  async updateChatTitle(chatId: number, title: string): Promise<Chat> {
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    chat.title = title;
    return chat;
  }

  async updateChatLastMessage(chatId: number, message: string): Promise<Chat> {
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    chat.lastMessage = message;
    chat.lastMessageTime = new Date();
    return chat;
  }

  async setActiveChatById(userId: number, chatId: number): Promise<void> {
    // Deactivate all other chats for this user
    await this.deactivateOtherChats(userId, chatId);
    
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    if (chat.userId !== userId) {
      throw new Error(`Chat with ID ${chatId} does not belong to user with ID ${userId}`);
    }
    
    chat.active = true;
  }

  async deactivateOtherChats(userId: number, activeChatId: number): Promise<void> {
    this.chats
      .filter(c => c.userId === userId && c.id !== activeChatId)
      .forEach(c => { c.active = false; });
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      ...insertMessage,
      timestamp: new Date()
    };
    this.messages.push(message);
    
    // Update the chat's last message
    const chat = this.chats.find(c => c.id === message.chatId);
    if (chat) {
      chat.lastMessage = message.content;
      chat.lastMessageTime = message.timestamp;
    }
    
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return this.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// Depending on MongoDB availability, use MongoDB or in-memory storage
export const storage = isMongoDBAvailable ? new MongoDBStorage() : new MemStorage();
