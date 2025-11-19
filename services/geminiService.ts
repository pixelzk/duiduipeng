import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to convert Blob to Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Analyzes audio to find which phrase from the list matches what was spoken.
 * Returns the index of the matched phrase, or -1 if no match.
 */
export const identifySpokenPhrase = async (
    audioBlob: Blob,
    possiblePhrases: string[]
): Promise<{ index: number; text: string } | null> => {
    try {
        const ai = getAiClient();
        
        // Convert Blob to Base64 using browser API instead of Buffer
        const base64Audio = await blobToBase64(audioBlob);

        const prompt = `
        I will provide an audio recording of a user reading a Chinese phrase.
        Here is a numbered list of possible phrases:
        ${JSON.stringify(possiblePhrases)}

        Task:
        1. Listen to the audio.
        2. Identify which phrase from the list the user is reading.
        3. If the user reads a phrase that is vaguely similar or a substring, match it.
        4. Return the index of the matching phrase in the array (0-based).
        5. If no phrase matches, return -1.

        Respond ONLY with a JSON object: { "index": number, "reason": "string" }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: audioBlob.type || "audio/wav",
                            data: base64Audio,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        index: { type: Type.INTEGER },
                        reason: { type: Type.STRING }
                    }
                }
            },
        });

        const jsonResult = JSON.parse(response.text || "{}");
        
        if (typeof jsonResult.index === 'number' && jsonResult.index >= 0 && jsonResult.index < possiblePhrases.length) {
            return {
                index: jsonResult.index,
                text: possiblePhrases[jsonResult.index]
            };
        }

        return null;

    } catch (error) {
        console.error("Gemini Audio Identification Error:", error);
        return null;
    }
};