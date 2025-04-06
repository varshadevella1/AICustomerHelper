import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string - this will need to be provided by the user
// Sample URI format - replace with your actual MongoDB URI
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://chatbot-ai:rxVuREGEQ3rhEMCC@mychatbot.adfitvo.mongodb.net/mychatbot?retryWrites=true&w=majority&appName=MyChatbot";

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    // Validate MongoDB URI format
    if (
      !MONGODB_URI ||
      !(
        MONGODB_URI.startsWith("mongodb://") ||
        MONGODB_URI.startsWith("mongodb+srv://")
      )
    ) {
      console.error(
        "Invalid MongoDB URI format. URI must start with mongodb:// or mongodb+srv://"
      );
      console.error(
        "Using in-memory storage instead. Data will be lost when the server restarts."
      );

      // Return without connecting - application will use in-memory storage
      return null;
    } else {
      // Configure mongoose connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 10000, // 10 second timeout
      };

      // Use the provided URI
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB successfully");
      return mongoose.connection;
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.log(
      "Using in-memory storage instead. Data will be lost when the server restarts."
    );
    // Continue without exiting - application will use in-memory storage
    return null;
  }
}

// Mongoose models
// User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Chat model
const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "💬",
  },
  active: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Message model
const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export models
export const User = mongoose.model("User", userSchema);
export const Chat = mongoose.model("Chat", chatSchema);
export const Message = mongoose.model("Message", messageSchema);

// Export connection
export default mongoose;
