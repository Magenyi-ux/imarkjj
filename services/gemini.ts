
import { GoogleGenAI, Type } from "@google/genai";
import { ExamType, Question, UserProfile, StudyMaterial } from "../types.ts";

// Polyfill process for browser environments to prevent white-screen crashes
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const API_KEY = (window as any).process?.env?.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Enterprise Rate Limiter & Queue Manager
 */
class AI_Queue {
  private static queue: (() => Promise<any>)[] = [];
  private static isProcessing = false;

  static async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.retryWithBackoff(task);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
      this.process();
    });
  }

  private static async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
      await new Promise(r => setTimeout(r, 800)); 
    }
    this.isProcessing = false;
  }

  private static async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status === 503)) {
        await new Promise(r => setTimeout(r, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }
}

export class AI_Service {
  private static model = "gemini-3-flash-preview";

  static async getExamQuestions(exam: ExamType, year: string, subject: string = "Use of English"): Promise<Question[]> {
    return AI_Queue.add(async () => {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: `Generate exactly 60 authentic past questions for the ${year} ${exam} exam (${subject}). 
        Include Socratic hints and detailed logic for correct/incorrect options.`,
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
                hints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "text", "options", "correctAnswer", "explanation", "context", "hints"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    });
  }

  static async generateTimetable(materials: StudyMaterial[], preferences: string): Promise<any> {
    return AI_Queue.add(async () => {
      const materialList = materials.map(m => m.name).join(", ");
      const response = await ai.models.generateContent({
        model: this.model,
        contents: `Create a 7-day study plan for: ${materialList}. Preferences: ${preferences}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                topic: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    });
  }
}
