import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Category, NewsItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a consistent image URL based on content
const getPlaceholderImage = (keyword: string, id: string) => {
    // Using picsum with a deterministic seed based on ID
    // We use the ID to keep the image consistent for the same news item
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${seed}/800/600`;
};

export const fetchNewsFeed = async (category: string, language: string = 'English'): Promise<NewsItem[]> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return generateMockNews(category);
  }

  try {
    const prompt = `
      Generate 5 distinct news headlines and summaries for the category: ${category}.
      Language: ${language}.
      
      Constraints:
      1. The summary MUST be approximately 60 words.
      2. The tone should be journalistic and objective.
      3. Include a fictional source name and a realistic timestamp.
      4. Provide a fictional URL for the full story.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              sourceName: { type: Type.STRING },
              publishedTime: { type: Type.STRING },
              fullStoryUrl: { type: Type.STRING },
              keywordForImage: { type: Type.STRING, description: "A single english keyword to search for an image"}
            },
            required: ["title", "summary", "sourceName", "publishedTime", "fullStoryUrl", "keywordForImage"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");

    const parsedItems = JSON.parse(jsonText);

    return parsedItems.map((item: any, index: number) => ({
      id: `${category}-${Date.now()}-${index}`,
      title: item.title,
      summary: item.summary,
      fullStoryUrl: item.fullStoryUrl,
      sourceName: item.sourceName,
      publishedTime: item.publishedTime,
      category: category,
      imageUrl: getPlaceholderImage(item.keywordForImage, `${category}-${Date.now()}-${index}`)
    }));

  } catch (error: any) {
    // Gracefully handle rate limits and quota errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isQuotaExceeded = errorMessage.includes('429') || 
                           errorMessage.includes('quota') || 
                           errorMessage.includes('limit') || 
                           error?.status === 429;

    if (isQuotaExceeded) {
      console.warn("Gemini API quota exceeded or rate limited. Using fallback data.");
    } else {
      console.error("Gemini API Error:", error);
    }
    return generateMockNews(category);
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for TTS.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

const generateMockNews = (category: string): NewsItem[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `mock-${i}`,
    title: `Major Update in ${category} Sector Announced Today`,
    summary: `In a significant turn of events for the ${category} industry, leading experts have unveiled a new strategy that promises to revolutionize the way operations are handled. The 60-word summary limit is strictly adhered to, ensuring you get the gist quickly. Early reports suggest positive market reaction with stocks rallying.`,
    fullStoryUrl: "https://example.com",
    sourceName: "Global News Wire",
    publishedTime: "2 hours ago",
    category: category,
    imageUrl: `https://picsum.photos/seed/${category}${i}/800/600`
  }));
};

export const generateAutoPilotNews = async (sourceText: string, customPrompt: string, category: string): Promise<NewsItem | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Auto Pilot.");
    return null;
  }

  try {
    const prompt = `
      ${customPrompt}

      Source Content/Context:
      ${sourceText}

      Category: ${category}

      Output must be in JSON format matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            sourceName: { type: Type.STRING },
            fullStoryUrl: { type: Type.STRING },
            keywordForImage: { type: Type.STRING }
          },
          required: ["title", "summary", "sourceName", "fullStoryUrl", "keywordForImage"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    const item = JSON.parse(jsonText);
    const id = `auto-${Date.now()}`;

    return {
      id,
      title: item.title,
      summary: item.summary,
      fullStoryUrl: item.fullStoryUrl,
      sourceName: item.sourceName,
      publishedTime: new Date().toISOString(),
      category,
      imageUrl: getPlaceholderImage(item.keywordForImage, id),
      status: 'published'
    };
  } catch (error) {
    console.error("Gemini Auto Pilot Error:", error);
    return null;
  }
};
