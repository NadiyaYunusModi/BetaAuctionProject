
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateVehicleSummary(vehicleData: any) {
  try {
    // When using generate content for text answers, do not define the model first and call generate content later.
    // Use ai.models.generateContent to query GenAI with both the model name and prompt.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a compelling, professional auction summary for this vehicle: ${JSON.stringify(vehicleData)}. 
      Highlight its value proposition for a bidder. Keep it under 100 words.`,
    });
    // The response object features a text property (not a method) that directly returns the string output.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "High-quality bank-repossessed vehicle available for auction.";
  }
}

export async function validateAuctionData(data: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a data validator. Check these auction records for inconsistencies (e.g. unrealistic prices, invalid fuel types, mismatched years/models): ${JSON.stringify(data)}. 
      Return a JSON list of identified issues.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    // The simplest and most direct way to get the generated text content is by accessing the .text property.
    const text = response.text || "[]";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Validation Error:", error);
    return [];
  }
}
