import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY as string | undefined;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface GeneratedMarket {
  title: string;
  options: string[];
  isMock?: boolean;
}

export const generateMarketData = async (prompt: string): Promise<GeneratedMarket> => {
  // Check if key is empty
  if (!API_KEY || !ai) {
    console.warn("⚠️ No API_KEY found. Using Mock Data.");
    return getMockData(prompt);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview",
      // Optimized system prompt for SHORT TERM/INSTANT Markets
      contents: `你是一个黑客松现场的预测市场助手。
      请根据用户的输入主题： "${prompt}"，生成一个**超短期**、**即时结算**的预测市场。
      
      规则:
      1. **必须使用中文**。
      2. 强调“未来1分钟”、“现在”、“现场”等紧迫感词汇。
      3. 选项必须互斥，适合快速下注。
      4. 选项尽量简短（不超过 10 个汉字）。
      
      返回标准的 JSON 格式。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "预测市场的标题（中文，强调时间紧迫）" },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "选项列表（中文）"
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");
    
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed.options)) {
      parsed.options = parsed.options.slice(0, 20);
    }
    return parsed;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return getMockData(prompt);
  }
};

const getMockData = (prompt: string): GeneratedMarket => {
  return {
    title: `[即时] ${prompt} 在 1 分钟内会发生吗？`,
    options: ["会 (Yes) 🟢", "不会 (No) 🔴"],
    isMock: true
  };
};
