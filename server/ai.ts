import OpenAI from "openai";
import { config } from "./config";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function analyzeFoodImage(base64Image: string): Promise<NutritionInfo> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert. Analyze the food in the image and provide nutritional information. Respond with JSON in this format: { calories: number, protein: number, carbs: number, fat: number }"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this meal and provide nutritional information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const result = JSON.parse(content);

    return {
      calories: Math.round(result.calories),
      protein: Math.round(result.protein * 10) / 10,
      carbs: Math.round(result.carbs * 10) / 10,
      fat: Math.round(result.fat * 10) / 10
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to analyze food image: " + error.message);
    }
    throw new Error("Failed to analyze food image: An unknown error occurred");
  }
}