import { GoogleGenAI, Type } from "@google/genai";
import { Meme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMeme = async (imageBase64: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: "Analyze this image and generate a hilarious meme caption, 3 relevant tags, a mood description, and a predicted virality score (0-100). Return ONLY JSON.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          mood: { type: Type.STRING },
          viralityScore: { type: Type.NUMBER },
        },
        required: ["caption", "tags", "mood", "viralityScore"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const searchMemes = async (query: string, memes: Meme[]) => {
  if (!memes.length) return [];

  const memeSummaries = memes.map(m => ({
    id: m.memeId,
    caption: m.caption,
    tags: m.tags.join(', '),
    mood: m.mood
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Query: "${query}"\n\nMemes:\n${JSON.stringify(memeSummaries)}`,
    config: {
      systemInstruction: "You are a semantic search engine for memes. Given a user query and a list of memes, return the IDs of the memes that most closely match the intent of the query, ordered by relevance. If no memes are relevant, return an empty array.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
    },
  });

  const matchingIds = JSON.parse(response.text) as string[];
  return matchingIds;
};

export const moderateComment = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Comment to moderate: "${text}"`,
    config: {
      systemInstruction: "You are a content moderator for a meme platform. Analyze the comment text for offensive content, hate speech, or spam. Return a JSON object with 'isAllowed' (boolean) and 'reason' (string, optional if blocked).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isAllowed: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
        },
        required: ["isAllowed"],
      },
    },
  });

  return JSON.parse(response.text);
};
