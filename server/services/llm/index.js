import GeminiService from './gemini.service.js';

/**
 * Pluggable LLM service factory
 * Allows easy switching between different LLM providers
 */
class LLMService {
    constructor(modelName = 'gemini') {
        this.modelName = modelName;
        this.service = this.createService(modelName);
    }

    createService(modelName) {
        switch (modelName.toLowerCase()) {
            case 'gemini':
                return new GeminiService();

            case 'openai':
                // Placeholder for OpenAI integration
                throw new Error('OpenAI integration coming soon');

            case 'local':
                // Placeholder for local model integration
                throw new Error('Local model integration coming soon');

            default:
                throw new Error(`Unknown model: ${modelName}. Supported: gemini, openai, local`);
        }
    }

    async generatePlan(instruction, url) {
        return await this.service.generatePlan(instruction, url);
    }

    validatePlan(plan) {
        return this.service.validatePlan(plan);
    }
}

export default LLMService;
