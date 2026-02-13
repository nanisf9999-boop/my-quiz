
import { GoogleGenAI, Type } from "@google/genai";
import { LockCategory, AIPuzzle } from "../types";

// Guidelines suggest initializing GoogleGenAI directly with process.env.API_KEY.
// We also instantiate it within functions to ensure the latest environment context is used.

export const generateLockPuzzle = async (category: LockCategory): Promise<AIPuzzle> => {
  // Always use a new GoogleGenAI instance with the named apiKey parameter.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  switch(category) {
    case 'AI_MATH':
      prompt = "Generate a fun math puzzle for a 7-year-old. Result should be a single number. Format: JSON with question and answer.";
      break;
    case 'AI_RIDDLE':
      prompt = "Generate a clever but simple riddle for a child. Format: JSON with question and answer.";
      break;
    case 'AI_WORD':
      prompt = "Pick a common 5-letter animal or object and scramble its letters. Format: JSON with 'question' as scrambled word and 'answer' as correct word.";
      break;
    case 'AI_LOGIC':
      prompt = "Generate a simple 'Who am I?' or logic puzzle for kids. Format: JSON with question and answer.";
      break;
    default:
      prompt = "Generate a fun kid-friendly question.";
  }

  // Use ai.models.generateContent directly with model name and prompt.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          hint: { type: Type.STRING }
        },
        required: ["question", "answer"]
      }
    }
  });

  // Use .text property to access the response string.
  const text = response.text;
  if (!text) throw new Error("Failed to get puzzle");
  return JSON.parse(text);
};

export const generateVictoryImage = async (): Promise<string | null> => {
  try {
    // Create fresh instance of GoogleGenAI.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // For gemini-2.5-flash-image, use generateContent and specify image generation config.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: "A super happy group of plasticine characters celebrating in front of an open vault filled with candy and toys, 3D clay style, vibrant colors, 4K." }]
      },
      config: { 
        imageConfig: { aspectRatio: "16:9" } 
      }
    });

    // Iterate through parts to find the image part (inlineData).
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Victory image generation error:", error);
    return null;
  }
};
