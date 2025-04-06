import session from "express-session";
import createMemoryStore from "memorystore";
import { User, Chat, Message } from "./db";
import { Types } from "mongoose";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createChat(chat: InsertChat): Promise<Chat>;
  getChatById(id: number): Promise<Chat | undefined>;
  getChatsByUserId(userId: number): Promise<Chat[]>;
  updateChatTitle(chatId: number, title: string): Promise<Chat>;
  updateChatLastMessage(chatId: number, message: string): Promise<Chat>;
  setActiveChatById(userId: number, chatId: number): Promise<void>;
  deactivateOtherChats(userId: number, activeChatId: number): Promise<void>;

  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;

  sessionStore: any;
}

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
  sender: "user" | "bot";
  timestamp: Date;
};

export type InsertUser = Omit<User, "id">;
export type InsertChat = Omit<Chat, "id">;
export type InsertMessage = Omit<Message, "id">;

export class MongoDBStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  private mapUser(user: any): User {
    return {
      id: parseInt(user._id.toString().substring(0, 8), 16),
      username: user.username,
      password: user.password,
    };
  }

  private mapChat(chat: any): Chat {
    return {
      id: parseInt(chat._id.toString().substring(0, 8), 16),
      userId: parseInt(chat.userId.toString().substring(0, 8), 16),
      title: chat.title,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.createdAt,
      icon: chat.icon,
      active: chat.active,
    };
  }

  private mapMessage(message: any): Message {
    return {
      id: parseInt(message._id.toString().substring(0, 8), 16),
      chatId: parseInt(message.chatId.toString().substring(0, 8), 16),
      content: message.content,
      sender: message.sender,
      timestamp: message.createdAt,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await User.find();
    const user = users.find(
      (u) => parseInt(u._id.toString().substring(0, 8), 16) === id
    );
    return user ? this.mapUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await User.findOne({ username });
    return user ? this.mapUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser = await User.create(insertUser);
    await this.createChat({
      userId: parseInt(newUser._id.toString().substring(0, 8), 16),
      title: "Welcome",
      lastMessage: "",
      lastMessageTime: new Date(),
      icon: "robot",
      active: true,
    });
    return this.mapUser(newUser);
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const users = await User.find();
    const user = users.find(
      (u) =>
        parseInt(u._id.toString().substring(0, 8), 16) === insertChat.userId
    );
    if (!user) throw new Error(`User ${insertChat.userId} not found`);

    const newChat = await Chat.create({
      userId: user._id,
      title: insertChat.title,
      lastMessage: insertChat.lastMessage,
      icon: insertChat.icon,
      active: insertChat.active,
    });

    return this.mapChat(newChat);
  }

  async getChatById(id: number): Promise<Chat | undefined> {
    const chats = await Chat.find();
    const chat = chats.find(
      (c) => parseInt(c._id.toString().substring(0, 8), 16) === id
    );
    return chat ? this.mapChat(chat) : undefined;
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    const users = await User.find();
    const user = users.find(
      (u) => parseInt(u._id.toString().substring(0, 8), 16) === userId
    );
    if (!user) return [];
    const chats = await Chat.find({ userId: user._id });
    return chats
      .map(this.mapChat)
      .sort(
        (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
  }

  async updateChatTitle(chatId: number, title: string): Promise<Chat> {
    const chats = await Chat.find();
    const chat = chats.find(
      (c) => parseInt(c._id.toString().substring(0, 8), 16) === chatId
    );
    if (!chat) throw new Error(`Chat ${chatId} not found`);
    chat.title = title;
    await chat.save();
    return this.mapChat(chat);
  }

  async updateChatLastMessage(chatId: number, message: string): Promise<Chat> {
    const chats = await Chat.find();
    const chat = chats.find(
      (c) => parseInt(c._id.toString().substring(0, 8), 16) === chatId
    );
    if (!chat) throw new Error(`Chat ${chatId} not found`);
    chat.lastMessage = message;
    await chat.save();
    return this.mapChat(chat);
  }

  async setActiveChatById(userId: number, chatId: number): Promise<void> {
    await this.deactivateOtherChats(userId, chatId);
    const chats = await Chat.find();
    const chat = chats.find(
      (c) => parseInt(c._id.toString().substring(0, 8), 16) === chatId
    );
    const users = await User.find();
    const user = users.find(
      (u) => parseInt(u._id.toString().substring(0, 8), 16) === userId
    );
    if (!chat || !user || !chat.userId.equals(user._id)) {
      throw new Error(`Chat ${chatId} does not belong to user ${userId}`);
    }
    chat.active = true;
    await chat.save();
  }

  async deactivateOtherChats(
    userId: number,
    activeChatId: number
  ): Promise<void> {
    const users = await User.find();
    const user = users.find(
      (u) => parseInt(u._id.toString().substring(0, 8), 16) === userId
    );
    if (!user) return;
    const userChats = await Chat.find({ userId: user._id });
    for (const chat of userChats) {
      if (parseInt(chat._id.toString().substring(0, 8), 16) !== activeChatId) {
        chat.active = false;
        await chat.save();
      }
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const chats = await Chat.find();
    const chat = chats.find(
      (c) =>
        parseInt(c._id.toString().substring(0, 8), 16) === insertMessage.chatId
    );
    if (!chat) throw new Error(`Chat ${insertMessage.chatId} not found`);

    const newMessage = await Message.create({
      chatId: chat._id,
      content: insertMessage.content,
      sender: insertMessage.sender,
    });

    chat.lastMessage = insertMessage.content;
    await chat.save();

    return this.mapMessage(newMessage);
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    const chats = await Chat.find();
    const chat = chats.find(
      (c) => parseInt(c._id.toString().substring(0, 8), 16) === chatId
    );
    if (!chat) return [];
    const messages = await Message.find({ chatId: chat._id });
    return messages
      .map(this.mapMessage)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MongoDBStorage();
