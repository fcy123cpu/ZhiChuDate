
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateSmartSchedule = async (prompt: string, date: string): Promise<AIResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `根据用户要求生成 ${date} 的日程安排: "${prompt}"。
               请提供合理的开始和结束时间、简洁的标题和描述。
               同时建议一个 'reminderMinutes'（提前提醒分钟数，如 15、30 或 0）。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "格式如 '09:00 - 10:30'" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                reminderMinutes: { type: Type.INTEGER, nullable: true },
                isUrgent: { type: Type.BOOLEAN }
              },
              required: ["time", "title", "description"]
            }
          }
        },
        required: ["tasks"]
      }
    }
  });

  const text = response.text; if (!text) { throw new Error('Response text is undefined'); } return JSON.parse(text) as AIResponse;
};
