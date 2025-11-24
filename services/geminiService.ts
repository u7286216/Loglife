import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry, VibeCheckResult } from "../types";

// NOTE: In a production environment, never expose API keys on the client side.
// This is structured for the demo using the user's local env variable or input.

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateVibeCheck = async (
  title: string,
  content: string,
  song: string
): Promise<VibeCheckResult | null> => {
  const ai = getAiClient();
  if (!ai) {
    console.warn("No API Key found. Skipping AI Vibe Check.");
    return null;
  }

  try {
    const prompt = `
      Analyze the following journal entry to determine the underlying "Vibe" or atmosphere.
      
      Entry Title: ${title}
      Entry Text: ${content}
      Song of the Day: ${song}
      
      Return a JSON object containing:
      1. 'theme': A short, creative, 2-4 word phrase describing the essence of the entry (e.g., "Melancholy Rain", "Manic Productivity").
      2. 'hexColor': A valid CSS Hex color code that visually represents the emotion of the text.
      3. 'sentiment': One of 'positive', 'neutral', or 'negative'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            hexColor: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
          },
          required: ["theme", "hexColor", "sentiment"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as VibeCheckResult;
  } catch (error) {
    console.error("Error generating vibe check:", error);
    // Fallback in case of error
    return {
      theme: "Unanalyzed",
      hexColor: "#cbd5e1",
      sentiment: "neutral"
    };
  }
};

export const getCityFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `Identify the city and state/country for these coordinates: Latitude ${lat}, Longitude ${lng}. Return ONLY the city and state/country name (e.g. "San Francisco, CA"). Do not add any other text.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text?.trim() || null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const streamAdvisorChat = async function* (
  entries: JournalEntry[],
  history: ChatMessage[],
  newMessage: string
) {
  const ai = getAiClient();
  if (!ai) {
    yield "API Key is missing. Please check your configuration.";
    return;
  }

  // Prepare Context from Journal Entries (Last 15 for relevance/token limits)
  const recentEntries = entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)
    .map(e => `
      Date: ${e.date}
      Title: ${e.title}
      Content: ${e.content}
      Sentiment: ${e.sentiment}
      Theme: ${e.theme}
    `).join('\n---\n');

  const systemInstruction = `
    You are 'LifeLog Advisor', an empathetic, insightful, and practical AI life coach and therapist.
    
    Your goal is to support the user by analyzing their journal entries and providing advice, encouragement, or tough love when needed.
    
    Here is the user's recent journal history for context:
    ${recentEntries}
    
    Rules:
    1. Be concise but warm.
    2. Reference specific past entries if relevant (e.g., "You mentioned feeling anxious last Tuesday...").
    3. Focus on growth, mindfulness, and practical steps.
    4. If the user asks about their goals, assume you have general knowledge of them from the context if mentioned.
  `;

  // Format history for the SDK
  const formattedHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: formattedHistory
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error in chat stream:", error);
    yield "Sorry, I encountered an error connecting to the advisor. Please try again.";
  }
};