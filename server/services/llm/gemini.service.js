import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.2,
                topK: 1,
                topP: 1,
            },
        });
    }

    /**
     * Generate a structured test plan from natural language instruction
     * @param {string} instruction - Natural language test instruction
     * @param {string} url - Target website URL
     * @returns {Promise<Object>} Structured plan with steps array
     */
    async generatePlan(instruction, url) {
        const prompt = `You are a website testing automation expert. Convert the following user instruction into a structured JSON test plan.

        Target URL: ${url}
        User Instruction: ${instruction}

        Generate a JSON object with a "steps" array. Each step should have one of these actions:
        - navigate: { "action": "navigate", "url": "https://..." }
        - click: { "action": "click", "selector": "css-selector or text=Visible Text" }
        - type: { "action": "type", "selector": "css-selector", "value": "text to type" }
        - verify: { "action": "verify", "keyword": "text that should appear on page" }
        - wait: { "action": "wait", "duration": milliseconds }

        Rules:
        1. Always start with a navigate action to the target URL
        2. Use text= prefix for clicking visible text (e.g., "text=Click Here")
        3. Use standard CSS selectors for inputs (e.g., "input[name='email']")
        4. Add verify steps to check for expected outcomes
        5. Keep selectors simple and reliable
        6. Maximum 10 steps

        Output ONLY valid JSON, no markdown, no explanation:
        {
        "steps": [...]
        }`;


        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean the response - remove markdown code blocks if present
            let cleanedText = text.trim();
            if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "");
            } else if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.replace(/```\n?/g, "");
            }

            // Parse JSON
            const plan = JSON.parse(cleanedText);
            
            // Validate plan structure
            if (!this.validatePlan(plan)) {
                throw new Error("Invalid plan structure returned by Gemini");
            }

            //example how the plan will look like
            // {
            //     "steps": [
            //       { "action": "navigate", "url": "https://example.com" },
            //       { "action": "click", "selector": "text=More information" },
            //       { "action": "verify", "keyword": "Example Domain" }
            //     ]
            // }

            return plan;
        } catch (error) {
            console.error("Error generating plan with Gemini:", error);
            throw new Error(`Failed to generate plan: ${error.message}`);
        }
    }

    /**
     * Validate the structure of the generated plan
     * @param {Object} plan - The plan object to validate
     * @returns {boolean} True if valid
     */
    validatePlan(plan) {
        if (!plan || typeof plan !== "object") {
            return false;
        }

        if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
            return false;
        }

        const validActions = ["navigate", "click", "type", "verify", "wait"];

        for (const step of plan.steps) {
            if (!step.action || !validActions.includes(step.action)) {
                return false;
            }

            // Validate required fields per action
            switch (step.action) {
                case "navigate":
                    if (!step.url) return false;
                    break;
                case "click":
                    if (!step.selector) return false;
                    break;
                case "type":
                    if (!step.selector || !step.value) return false;
                    break;
                case "verify":
                    if (!step.keyword) return false;
                    break;
                case "wait":
                    if (!step.duration) return false;
                    break;
            }
        }

        return true;
    }

    /**
     * Retry logic wrapper
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise} Result of function
     */
    async withRetry(fn, maxRetries = 3) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${i + 1} failed, retrying...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
            }
        }

        throw lastError;
    }
}

export default GeminiService;
