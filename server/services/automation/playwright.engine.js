import { chromium, firefox, webkit } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PlaywrightEngine {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.networkLogs = [];
    }

    /**
     * Initialize browser instance
     * @param {boolean} headless - Run in headless mode
     * @param {string} browserType - Browser to use: 'chromium', 'firefox', 'webkit'
     */
    async initialize(headless = true, browserType = 'chromium') {
        try {
            const browsers = { chromium, firefox, webkit };
            const selectedBrowser = browsers[browserType] || chromium;

            this.browser = await selectedBrowser.launch({
                headless,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.context = await this.browser.newContext({
                viewport: { width: 1920, height: 1080 }
            });
            this.page = await this.context.newPage();

            // Set default timeout
            this.page.setDefaultTimeout(30000);

            // Enable network request logging
            this.page.on('request', request => {
                this.networkLogs.push({
                    type: 'request',
                    method: request.method(),
                    url: request.url(),
                    timestamp: new Date()
                });
            });

            this.page.on('response', response => {
                this.networkLogs.push({
                    type: 'response',
                    status: response.status(),
                    url: response.url(),
                    timestamp: new Date()
                });
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize browser:', error);
            throw error;
        }
    }

    /**
     * Execute a test plan step by step with retry logic
     * @param {Array} steps - Array of test steps
     * @param {string} sessionId - Unique session identifier
     * @param {Function} logCallback - Callback for logging
     * @returns {Promise<Array>} Executed steps with results
     */
    async executePlan(steps, sessionId, logCallback) {
        const results = [];
        const screenshotDir = path.join(__dirname, '../../reports', sessionId);

        // Create screenshot directory
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepResult = { ...step, status: 'success', timestamp: new Date() };

            // Retry logic: attempt up to 3 times
            const maxRetries = 2;
            let lastError = null;

            for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
                try {
                    if (retryCount > 0) {
                        logCallback('info', `Retry attempt ${retryCount} for step ${i + 1}`);
                        await this.wait(1000 * retryCount); // Exponential backoff
                    }

                    logCallback('info', `Executing step ${i + 1}/${steps.length}: ${step.action}`);

                    switch (step.action) {
                        case 'navigate':
                            await this.navigate(step.url);
                            logCallback('success', `Navigated to ${step.url}`);
                            break;

                        case 'click':
                            await this.click(step.selector);
                            logCallback('success', `Clicked on ${step.selector}`);
                            break;

                        case 'type':
                            await this.type(step.selector, step.value);
                            logCallback('success', `Typed "${step.value}" into ${step.selector}`);
                            break;

                        case 'verify':
                            await this.verify(step.keyword);
                            logCallback('success', `Verified keyword: "${step.keyword}"`);
                            break;

                        case 'wait':
                            await this.wait(step.duration);
                            logCallback('success', `Waited for ${step.duration}ms`);
                            break;

                        default:
                            throw new Error(`Unknown action: ${step.action}`);
                    }

                    // Capture and compress screenshot after successful step
                    const screenshotPath = path.join(screenshotDir, `step-${i + 1}.png`);
                    const screenshotBuffer = await this.page.screenshot({ fullPage: false });

                    // Compress screenshot using sharp
                    await sharp(screenshotBuffer)
                        .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
                        .png({ quality: 80, compressionLevel: 9 })
                        .toFile(screenshotPath);

                    stepResult.screenshotPath = `/reports/${sessionId}/step-${i + 1}.png`;
                    logCallback('info', `Screenshot saved for step ${i + 1}`);

                    // Success! Break out of retry loop
                    lastError = null;
                    break;

                } catch (error) {
                    lastError = error;

                    if (retryCount === maxRetries) {
                        // Final retry failed
                        stepResult.status = 'failed';
                        stepResult.error = this.formatErrorMessage(error, step);
                        logCallback('error', `Step ${i + 1} failed after ${maxRetries + 1} attempts: ${stepResult.error}`);

                        // Try to capture error screenshot
                        try {
                            const errorScreenshotPath = path.join(screenshotDir, `step-${i + 1}-error.png`);
                            const errorBuffer = await this.page.screenshot({ fullPage: false });

                            await sharp(errorBuffer)
                                .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
                                .png({ quality: 80, compressionLevel: 9 })
                                .toFile(errorScreenshotPath);

                            stepResult.screenshotPath = `/reports/${sessionId}/step-${i + 1}-error.png`;
                        } catch (screenshotError) {
                            console.error('Failed to capture error screenshot:', screenshotError);
                        }
                    }
                }
            }

            results.push(stepResult);

            // Stop execution if step failed after all retries
            if (lastError !== null) {
                break;
            }
        }

        return results;
    }

    /**
     * Format error messages to be more actionable
     */
    formatErrorMessage(error, step) {
        const message = error.message;

        if (message.includes('timeout') || message.includes('Timeout')) {
            return `Timeout: Element "${step.selector || 'target'}" not found within 30 seconds. Try: 1) Verify the selector is correct, 2) Increase timeout, or 3) Wait for page to load first.`;
        }

        if (message.includes('not visible') || message.includes('not clickable')) {
            return `Element not visible: "${step.selector}" exists but is hidden or covered. Try: 1) Scroll to element first, 2) Wait for animations, or 3) Check if element is in a modal.`;
        }

        if (message.includes('navigation')) {
            return `Navigation failed: Could not load "${step.url}". Try: 1) Check URL is valid, 2) Verify internet connection, or 3) Check if site is blocking automation.`;
        }

        if (message.includes('Keyword') && message.includes('not found')) {
            return `${message} (search was case-insensitive). The page loaded but doesn't contain this text. Try: 1) Check spelling, 2) Wait for dynamic content, or 3) Verify you're on the correct page.`;
        }

        return `${message}`;
    }

    /**
     * Navigate to a URL
     */
    async navigate(url) {
        try {
            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        } catch (error) {
            throw new Error(`Navigation failed: ${error.message}`);
        }
    }

    /**
     * Click an element with smart fallback selectors
     */
    async click(selector) {
        const selectors = this.generateSelectorFallbacks(selector);

        for (const sel of selectors) {
            try {
                await this.page.click(sel, { timeout: 5000 });
                return; // Success!
            } catch (error) {
                // Try next selector
                continue;
            }
        }

        // All selectors failed
        throw new Error(`Could not click element with selector: ${selector}`);
    }

    /**
     * Generate smart fallback selectors
     */
    generateSelectorFallbacks(selector) {
        const fallbacks = [selector];

        if (selector.startsWith('text=')) {
            const text = selector.substring(5);
            fallbacks.push(
                `text="${text}"`, // Try with quotes
                `text=${text} >> visible=true`, // Ensure visible
                `button:has-text("${text}")`, // Try button with text
                `a:has-text("${text}")` // Try link with text
            );
        } else if (selector.includes('button')) {
            fallbacks.push(
                selector.replace('button', '[role="button"]'),
                selector.replace('button', 'button, [role="button"]')
            );
        } else if (selector.startsWith('#')) {
            const id = selector.substring(1);
            fallbacks.push(`[id="${id}"]`);
        }

        return fallbacks;
    }

    /**
     * Type into an input field with smart fallback
     */
    async type(selector, value) {
        try {
            await this.page.fill(selector, value, { timeout: 5000 });
        } catch (error) {
            // Try alternative: click first, then type
            try {
                await this.page.click(selector);
                await this.page.keyboard.type(value);
            } catch (retryError) {
                throw new Error(`Could not type into element: ${selector}`);
            }
        }
    }

    /**
     * Verify keyword appears on page (case-insensitive)
     */
    async verify(keyword) {
        const content = await this.page.textContent('body');
        const normalizedContent = content.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();

        if (!normalizedContent.includes(normalizedKeyword)) {
            throw new Error(`Keyword "${keyword}" not found on page`);
        }
    }

    /**
     * Wait for specified duration
     */
    async wait(duration) {
        await this.page.waitForTimeout(duration);
    }

    /**
     * Get network logs
     */
    getNetworkLogs() {
        return this.networkLogs;
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics() {
        const metrics = await this.page.evaluate(() => {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;

            return {
                loadTime,
                domReady,
                timestamp: new Date().toISOString()
            };
        });
        return metrics;
    }

    /**
     * Close browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }
}

export default PlaywrightEngine;
