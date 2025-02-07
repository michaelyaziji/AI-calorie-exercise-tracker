import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function analyzeFoodImage(base64Image: string): Promise<NutritionInfo> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      calories: Math.round(result.calories),
      protein: Math.round(result.protein * 10) / 10,
      carbs: Math.round(result.carbs * 10) / 10,
      fat: Math.round(result.fat * 10) / 10
    };
  } catch (error) {
    throw new Error("Failed to analyze food image: " + error.message);
  }
}
