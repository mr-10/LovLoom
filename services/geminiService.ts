import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface ImageData {
  base64: string;
  mimeType: string;
}

const prompts = [
  "Using the two provided photos of a couple, generate a new photorealistic image of them celebrating their 25th wedding anniversary. They are at a candlelit dinner in an elegant restaurant, raising their glasses for a toast. They should look happy, deeply in love, with subtle signs of aging gracefully. The atmosphere is romantic and sophisticated.",
  "Using the two provided photos of a couple, generate a new photorealistic image of them enjoying a hobby together. They are hiking on a scenic mountain trail at sunset, pausing to admire the view. They are in comfortable hiking gear, looking adventurous and content in a beautiful, natural landscape.",
  "Using the two provided photos of a couple, generate a new photorealistic image of them as a loving older couple in their late 60s. They are sitting on a porch swing outside a charming cottage, reading a book together and smiling. The setting is a peaceful garden in the afternoon, conveying a sense of warmth and lifelong companionship."
];

const promptWithChild = "Using the three provided photos of a husband, a wife, and their child, generate a new photorealistic image of them happily posing for the future as a family. They should be smiling together. The background is their beautiful, modern house, with soft, natural lighting.";

async function generateImage(prompt: string, images: ImageData[]): Promise<string> {
  const imageParts = images.map(image => ({
    inlineData: {
      data: image.base64,
      mimeType: image.mimeType,
    },
  }));

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [textPart, ...imageParts],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image data found in the API response.");
}

export const generateCoupleImages = async (husband: ImageData, wife: ImageData, child?: ImageData): Promise<string[]> => {
    const imagePromises: Promise<string>[] = [];

    // Image 1: Anniversary Milestone
    imagePromises.push(generateImage(prompts[0], [husband, wife]));

    // Image 2: Hobby Together
    imagePromises.push(generateImage(prompts[1], [husband, wife]));

    // Image 3: With Child or Aging Gracefully
    if (child) {
        imagePromises.push(generateImage(promptWithChild, [husband, wife, child]));
    } else {
        imagePromises.push(generateImage(prompts[2], [husband, wife]));
    }
    
    return Promise.all(imagePromises);
};