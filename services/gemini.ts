
import { GoogleGenAI, Type } from "@google/genai";
import { ExamType, Question, UserProfile, StudyMaterial } from "../types";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Enterprise Rate Limiter & Queue Manager
 * Prevents 429 errors by ensuring sequential execution with backoff.
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
      // Safe delay between requests for low-end phone CPU stability
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
        Strict Requirements:
        1. Historical Accuracy: Match the difficulty and weighting of that specific year.
        2. Socratic Hints: Provide 2 levels of hints for study mode.
        3. Real-world Context: Mention a specific Nigerian use-case for the concept (where it's used).
        4. Deep Logic: Explain why the correct answer is right AND why common pitfalls (distractors) are wrong.`,
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

  static async chatWithAgent(
    message: string, 
    profile: UserProfile, 
    onMemoryUpdate: (newMemory: string) => void
  ): Promise<string> {
    return AI_Queue.add(async () => {
      const styleInstruction = profile.interactionStyle === 'CONCISE' 
        ? "Be extremely direct. Brief answers." 
        : "Be thorough and academic. Use step-by-step logic.";

      const systemPrompt = `Expert Nigerian Tutor. User: ${profile.name}. Style: ${styleInstruction}.
      Location: ${profile.location ? `Lat ${profile.location.latitude}, Lng ${profile.location.longitude}` : "Unknown"}.
      Past Knowledge: ${profile.memories.join(", ")}.
      
      Always explain 'how, why, where'. Include 'MEMORY_UPDATE:' if you detect a persistent personality trait.`;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleMaps: {} }],
        }
      });

      const text = response.text || "";
      if (text.includes("MEMORY_UPDATE:")) {
        const parts = text.split("MEMORY_UPDATE:");
        onMemoryUpdate(parts[1].trim());
        return parts[0].trim();
      }
      return text;
    });
  }

  static async generateTimetable(materials: StudyMaterial[], preferences: string): Promise<any> {
    return AI_Queue.add(async () => {
      const materialList = materials.map(m => m.name).join(", ");
      const response = await ai.models.generateContent({
        model: this.model,
        contents: `Create a 7-day study plan for materials: ${materialList}. Preferences: ${preferences}.`,
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
