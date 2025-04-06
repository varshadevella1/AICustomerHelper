import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key" });

// Generate AI response based on conversation history
export async function generateAIResponse(
  message: string, 
  chatHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<string> {
  try {
    // Build the messages array for OpenAI
    const messages = [
      {
        role: "system",
        content: 
          "You are an AI-powered customer support assistant for a SaaS platform. " +
          "You help users with billing issues, account setup, and feature requests. " +
          "Be friendly, helpful, and concise. If you don't know the answer, don't make up information - " +
          "instead, suggest that the user might want to contact a human agent for more assistance."
      },
      ...chatHistory,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}

// Generate a title for a new chat based on the first message
export async function generateChatTitle(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an assistant that generates short, concise chat titles based on the user's first message. " +
            "The title should be 2-4 words maximum and capture the essence of what the user is asking about."
        },
        {
          role: "user",
          content: `Generate a short title (2-4 words maximum) for a chat that starts with this message: "${message}"`
        }
      ],
      max_tokens: 15,
      temperature: 0.7,
    });

    const title = response.choices[0].message.content?.trim() || "New Conversation";
    return title.replace(/^"|"$/g, ''); // Remove quotes if they exist
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "New Conversation";
  }
}
