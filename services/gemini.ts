
import { GoogleGenAI, Type } from "@google/genai";
import { ExamType, Question, UserProfile, StudyMaterial } from "../types";

export class AI_Service {
  private static defaultModel = "gemini-3-flash-preview";
  private static groundingModel = "gemini-2.5-flash";

  static async getExamQuestions(exam: ExamType, year: string, subject: string = "Use of English"): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: this.defaultModel,
      contents: `Generate 60 authentic past questions from the ${year} ${exam} exam for the subject ${subject}. 
      Return as JSON with full deconstruction logic.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              context: { type: Type.STRING },
              deconstruction: {
                type: Type.OBJECT,
                properties: {
                  logic: { type: Type.STRING },
                  mnemonic: { type: Type.STRING },
                  atomic: { type: Type.ARRAY, items: { type: Type.STRING } },
                  roadmap: { type: Type.STRING },
                  scenario: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }

  static async chatWithAgent(message: string, profile: UserProfile, onMemoryUpdate: (newMemory: string) => void): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemPrompt = `You are an expert Nigerian exam tutor. Profile: ${profile.name}. Target: ${profile.targetExam}. Protocol: If vague, ask clarifying questions. Append MEMORY_UPDATE: for new insights.`;
    const response = await ai.models.generateContent({
      model: this.groundingModel,
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleMaps: {} }],
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    const text = response.text || "";
    if (text.includes("MEMORY_UPDATE:")) {
      const parts = text.split("MEMORY_UPDATE:");
      onMemoryUpdate(parts[1].trim());
      return parts[0].trim();
    }
    return text;
  }

  static async searchTopicResources(topic: string): Promise<{title: string, url: string}[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: this.defaultModel,
      contents: `Find 3 high-quality, free educational resources (PDFs, YouTube videos, or Edu-sites) for the WAEC/JAMB topic: "${topic}". Return a simple JSON list with title and url keys.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "url"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }

  static async generateTimetable(materials: StudyMaterial[], preferences: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const materialList = materials.map(m => `- ${m.name}`).join("\n");
    const response = await ai.models.generateContent({
      model: this.defaultModel,
      contents: `Generate a 7-day study timetable for: ${materialList}. Preferences: ${preferences}. Assign a unique ID to each session.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              day: { type: Type.STRING },
              topic: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING }
            }
          }
        }
      }
    });
    const sessions = JSON.parse(response.text || "[]");
    return sessions.map((s: any) => ({ ...s, mastery: 0, resources: [] }));
  }
}
