
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, Quest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateQuest = async (subject: Subject, level: number): Promise<Quest> => {
  const prompt = `Generate a fun, kid-friendly educational quest about ${subject} for level ${level}. 
  The difficulty should be appropriate for a child aged 6-10. 
  Make it engaging and story-driven. Provide 4 options and one correct answer.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: 'The educational question or riddle.' },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'List of 4 possible answers.'
          },
          correctAnswer: { type: Type.STRING, description: 'The exactly matching string from options.' },
          explanation: { type: Type.STRING, description: 'A short, encouraging explanation of why the answer is correct.' },
          theme: { type: Type.STRING, description: 'A short visual theme for the background (e.g., "sunny jungle", "underwater palace").' }
        },
        required: ["question", "options", "correctAnswer", "explanation", "theme"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to get quest data");
  return JSON.parse(text);
};

export const generateRewardImage = async (theme: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A vibrant, cute, 3D style Pixar-like illustration of a magical trophy or a friendly animal celebration in a ${theme} environment. Bright colors, happy atmosphere, 4K resolution.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed", error);
    return null;
  }
};
