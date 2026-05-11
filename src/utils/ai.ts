import { envVars } from "../config/env";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface AIRequestOptions {
    model?: string;
    messages: any[];
    tools?: any[];
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
}

/**
 * Communicates with OpenRouter API
 */
export const callOpenRouter = async (options: AIRequestOptions) => {
    const { 
        model = "openai/gpt-4o-mini", 
        messages, 
        tools, 
        temperature = 0.7, 
        max_tokens 
    } = options;

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${envVars.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": envVars.APP_URL || "http://localhost:3000",
            "X-Title": "SkillBridge"
        },
        body: JSON.stringify({
            model,
            messages,
            tools,
            temperature,
            max_tokens,
            response_format: options.response_format,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("OpenRouter API Error Details:", JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || `OpenRouter API error: ${response.statusText}`);
    }

    if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response form OpenRouter: No choices returned");
    }

    return data.choices[0].message;
};
