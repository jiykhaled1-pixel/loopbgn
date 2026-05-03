/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getGameRecommendation(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `You are LoopBot, a board game expert assistant for the "loopbgn" community.
      Answer in Arabic. The user is asking for a recommendation: "${prompt}".
      Be friendly, enthusiastic, and provide specific board game names and why they fit.
      Keep the response concise and helpful.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، واجهت مشكلة في التفكير حالياً. حاول مرة أخرى لاحقاً! 🎲";
  }
}
