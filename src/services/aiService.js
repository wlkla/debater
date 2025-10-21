class AIConnectionError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "AIConnectionError";
    this.details = details;
  }
}

class AIService {
  constructor() {
    this.baseUrl = '/api'; // Revert to local proxy
  }

  hasApiKey() {
    return !!this.getApiKey();
  }

  getApiKey() {
    return localStorage.getItem('ai_api_key') || '';
  }

  setApiKey(apiKey) {
    localStorage.setItem('ai_api_key', apiKey);
  }

  clearApiKey() {
    localStorage.removeItem('ai_api_key');
  }

  async callAI(messages) {
    const apiKey = this.getApiKey(); // Get API key from localStorage
    if (!apiKey) {
      throw new AIConnectionError('API Key not configured in localStorage.', { code: 'apikey_not_found' });
    }

    const apiUrl = `${this.baseUrl}/chat/completions`;
    
    const headers = {
      "Authorization": `Bearer ${apiKey}`, // Use API key from localStorage
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "api-key": apiKey,
    };

    const payload = {
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1500
    };

    console.log('📤 Sending request to AI service:', { url: apiUrl, messageCount: messages.length, model: payload.model });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AI Response error details:', { status: response.status, statusText: response.statusText, body: errorText });
        throw new AIConnectionError(`HTTP error! status: ${response.status}`, errorText);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
        const content = data.choices[0].message.content.trim();
        return content;
      } else {
        console.error('❌ Invalid AI response structure:', data);
        throw new Error(`No valid response received from AI.`);
      }
    } catch (error) {
      console.error('❌ AI API Error details:', { message: error.message, url: apiUrl });
       if (error instanceof AIConnectionError) {
        throw error;
      }
      throw new AIConnectionError(`Network or unknown error: ${error.message}`);
    }
  }

  async generateCounterArguments(opinion) {
    const systemPrompt = `You are an Opponent AI in a debate battle. Your task is to generate 3 distinct and challenging counter-arguments to the user's statement. Return the arguments in a JSON array of strings.

Example response:
[
  "Counter-argument 1",
  "Counter-argument 2",
  "Counter-argument 3"
]`;
    const userPrompt = `User's statement: "${opinion}"`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let responseText = '';
    try {
      responseText = await this.callAI(messages);
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        responseText = match[1];
      }
      return JSON.parse(responseText);
    } catch (e) {
      if (e instanceof AIConnectionError) throw e;
      console.error("Failed to parse counter-arguments:", e, "Original response:", responseText);
      throw new Error("Opponent AI returned invalid response format.");
    }
  }

  async rateArgument(conversationHistory, argumentToRate) {
    const systemPrompt = `你是一个辩论对战中的裁判AI。你的任务是根据辩论历史的上下文，评估一个论点的强度和相关性。

- 以1到5的等级（1 = 非常弱，2 = 弱，3 = 中等，4 = 强，5 = 非常强）对论点进行评分。
- 用一句话简要说明你的评分理由。

以JSON对象形式返回你的判断，包含 "attack" 和 "reason" 两个键。

示例响应：
{ "attack": 3, "reason": "这是一个有效的观点，但缺乏强有力的证据。" }`;

    const userPrompt = `Debate History:
${conversationHistory}

Argument to Rate:
"${argumentToRate}"`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let responseText = '';
    try {
      responseText = await this.callAI(messages);
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        responseText = match[1];
      }
      return JSON.parse(responseText);
    } catch (e) {
      if (e instanceof AIConnectionError) throw e;
      console.error("Failed to parse rating:", e, "Original response:", responseText);
      throw new Error("Referee AI returned invalid response format.");
    }
  }

  async generatePlayerArguments(opinion, counterArguments) {
    const systemPrompt = `You are a friendly AI assistant in a debate battle. Your task is to help the user by generating 3 distinct and strong arguments that support the user's original statement and counter the opponent's arguments. 

You MUST return ONLY a valid JSON array of strings, without any other text, explanations, or markdown.

User's original statement: "${opinion}"

Opponent's counter-arguments:
- ${counterArguments.join('\n- ')}

Generate 3 arguments for the user to use.`;
    const userPrompt = `Please generate 3 helpful arguments for me.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let responseText = '';
    try {
      responseText = await this.callAI(messages);
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        responseText = match[1];
      }
      return JSON.parse(responseText);
    } catch (e) {
      if (e instanceof AIConnectionError) throw e;
      console.error("Failed to parse helpful arguments:", e, "Original response:", responseText);
      throw new Error("Helpful AI returned invalid response format.");
    }
  }

  async getHelpfulArguments(opinion) {
    const counterArguments = await this.generateCounterArguments(opinion);
    const helpfulArguments = await this.generatePlayerArguments(opinion, counterArguments);
    return helpfulArguments;
  }
}

export default new AIService();
