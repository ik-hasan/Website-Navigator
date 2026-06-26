import { v4 as uuidv4 } from 'uuid';
import Report from '../models/Report.js';
import LLMService from '../services/llm/index.js';
import PlaywrightEngine from '../services/automation/playwright.engine.js';

/**
 * Execute a test based on natural language instruction
 */
export const executeTest = async (req, res) => {
    const { url, instruction, model = 'gemini', browserType = 'chromium', headless = true } = req.body;
    const io = req.app.get('io');

    // Validate input
    if (!url || !instruction) {
        return res.status(400).json({ error: 'URL and instruction are required' });
    }

    const sessionId = uuidv4();

    // Create log callback function
    const logCallback = (level, message) => {
        console.log(`[${level.toUpperCase()}] ${message}`);
        io.emit('log', { sessionId, level, message, timestamp: new Date() });
    };

    try {
        logCallback('info', `Starting test execution - Session: ${sessionId}`);
        logCallback('info', `Target URL: ${url}`);
        logCallback('info', `Model: ${model}`);
        logCallback('info', `Browser: ${browserType}`);

        // Initialize LLM service
        logCallback('info', 'Initializing LLM service...');
        const llmService = new LLMService(model);

        // Generate test plan
        logCallback('info', 'Generating test plan from instruction...');
        const plan = await llmService.generatePlan(instruction, url);
        logCallback('success', `Generated plan with ${plan.steps.length} steps`);

        // Initialize Playwright engine
        logCallback('info', 'Starting browser automation...');
        const engine = new PlaywrightEngine();
        await engine.initialize(headless, browserType);
        logCallback('success', 'Browser initialized');

        // Execute plan
        logCallback('info', 'Executing test steps...');
        const stepsExecuted = await engine.executePlan(plan.steps, sessionId, logCallback);

        // Close browser
        await engine.close();
        logCallback('success', 'Browser closed');

        // Determine final status
        const failedSteps = stepsExecuted.filter(s => s.status === 'failed');
        const finalStatus = failedSteps.length === 0 ? 'success' :
            failedSteps.length === stepsExecuted.length ? 'failed' : 'partial';

        // Generate summary
        const summary = `Executed ${stepsExecuted.length} steps. ` +
            `Success: ${stepsExecuted.filter(s => s.status === 'success').length}, ` +
            `Failed: ${failedSteps.length}`;

        // Save report to database
        logCallback('info', 'Saving report to database...');
        const report = new Report({
            sessionId,
            url,
            instruction,
            model,
            headless,
            stepsExecuted,
            finalStatus,
            summary
        });

        await report.save();
        logCallback('success', 'Report saved successfully');
        logCallback('info', `Test execution completed - Status: ${finalStatus}`);

        // Return session ID
        res.json({
            sessionId,
            finalStatus,
            summary,
            stepsCount: stepsExecuted.length
        });

    } catch (error) {
        console.error('Test execution error:', error);
        logCallback('error', `Execution failed: ${error.message}`);

        // Try to save error report
        try {
            const errorReport = new Report({
                sessionId,
                url,
                instruction,
                model,
                headless,
                stepsExecuted: [],
                finalStatus: 'failed',
                summary: `Execution failed: ${error.message}`
            });
            await errorReport.save();
        } catch (saveError) {
            console.error('Failed to save error report:', saveError);
        }

        res.status(500).json({
            error: 'Test execution failed',
            message: error.message,
            sessionId
        });
    }
};
