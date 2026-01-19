
import { AIResponse, Task } from "../types";

/**
 * 智能规划核心入口 - 采用 豆包 (Doubao) Pro 大模型
 * 使用火山引擎 (Volcengine) Ark 接口
 */
export const generateSmartSchedule = async (
  prompt: string, 
  date: string, 
  history: Task[] = []
): Promise<AIResponse> => {
  // 获取 API Key
  const apiKey = process.env.API_KEY; 
  if (!apiKey) {
    throw new Error("API Key 未配置");
  }

  // 豆包 (Volcengine) 需要明确的 Endpoint ID (模型接入点)
  // 这里使用环境变量或默认的占位符（实际使用时需要替换为用户自己的 Endpoint ID）
  // 格式通常为：ep-2024xxxx-xxxxx
  const modelEndpoint = process.env.DOUBAO_MODEL_ENDPOINT || "ep-20240604-doubao-pro-4k"; 

  // 提取历史任务摘要
  const memoryContext = history.length > 0 
    ? history.slice(-15).map(t => `- ${t.date} ${t.time}: ${t.title}`).join('\n')
    : "暂无历史记录";

  const systemInstruction = `
    你是一个极其聪明、有记忆能力的日程规划专家。
    用户会告诉你他的一天安排。你需要将其转化为结构化的 JSON 任务列表。
    
    【记忆 context】：
    这是用户过去的一些日程安排，请根据这些历史规律（例如用户习惯在什么时间锻炼或工作）来优化你的建议：
    ${memoryContext}

    【输出规则】：
    1. 必须严格只返回 JSON 格式字符串，不要包含 Markdown 标记（如 \`\`\`json ... \`\`\`）。
    2. JSON 根对象必须包含 "tasks" 数组。
    3. 每个任务包含:
       - "time": 字符串，格式 'HH:mm - HH:mm'
       - "title": 字符串，简洁标题
       - "description": 字符串，详细描述
       - "reminderMinutes": 整数 (可选)，提前提醒分钟数
       - "isUrgent": 布尔值，根据描述判断是否紧急
    
    示例格式：
    {
      "tasks": [
        { "time": "09:00 - 10:00", "title": "晨间锻炼", "description": "开启活力一天", "isUrgent": false }
      ]
    }
  `;

  const userContent = `目标日期: ${date}. 用户当前输入: "${prompt}"`;

  try {
    // 调用火山引擎 (Volcengine) Ark API (OpenAI 兼容接口)
    const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelEndpoint,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent }
        ],
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Doubao API Error:", errText);
      throw new Error(`AI 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // 清理可能存在的 Markdown 代码块标记，防止解析失败
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(content) as AIResponse;
  } catch (error) {
    console.error("豆包 AI 规划失败:", error);
    // 为了防止在演示环境中因 Key 不匹配而崩溃，这里可以返回一个空的 fallback 或者重新抛出
    throw error;
  }
};
