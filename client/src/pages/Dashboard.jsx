import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import { executeTest } from '../services/api';
import LogConsole from '../components/LogConsole';
import ScreenshotGallery from '../components/ScreenshotGallery';

function Dashboard() {
    const [url, setUrl] = useState('');
    const [instruction, setInstruction] = useState('');
    const [model, setModel] = useState('gemini');
    const [browserType, setBrowserType] = useState('chromium');
    const [headless, setHeadless] = useState(true);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [result, setResult] = useState(null);
    const [screenshots, setScreenshots] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [totalSteps, setTotalSteps] = useState(0);

    useEffect(() => {
        // Connect to WebSocket
        socketService.connect();

        // Listen for log events
        const handleLog = (logData) => {
            setLogs((prev) => [...prev, logData]);

            // Track progress
            if (logData.message.includes('Generated plan with')) {
                const stepsMatch = logData.message.match(/(\d+) steps/);
                if (stepsMatch) {
                    setTotalSteps(parseInt(stepsMatch[1]));
                }
            }

            if (logData.message.includes('Executing step')) {
                const stepMatch = logData.message.match(/step (\d+)/);
                if (stepMatch) {
                    setCurrentStep(parseInt(stepMatch[1]));
                }
            }

            // If screenshot is mentioned, add to screenshots array
            if (logData.message.includes('Screenshot saved')) {
                const stepMatch = logData.message.match(/step (\d+)/);
                if (stepMatch && sessionId) {
                    const stepNum = stepMatch[1];
                    setScreenshots((prev) => [
                        ...prev,
                        {
                            url: `http://localhost:5000/reports/${sessionId}/step-${stepNum}.png`,
                            step: stepNum,
                        },
                    ]);
                }
            }
        };

        socketService.on('log', handleLog);

        return () => {
            socketService.off('log', handleLog);
        };
    }, [sessionId]);

    const handleExecute = async () => {
        if (!url || !instruction) {
            alert('Please provide both URL and instruction');
            return;
        }

        setLoading(true);
        setLogs([]);
        setScreenshots([]);
        setResult(null);
        setSessionId(null);
        setCurrentStep(0);
        setTotalSteps(0);

        try {
            const response = await executeTest({
                url,
                instruction,
                model,
                browserType,
                headless,
            });

            setSessionId(response.data.sessionId);
            setResult(response.data);
            setLogs((prev) => [
                ...prev,
                {
                    level: 'success',
                    message: ` Test completed with status: ${response.data.finalStatus}`,
                    timestamp: new Date(),
                },
            ]);
        } catch (error) {
            setLogs((prev) => [
                ...prev,
                {
                    level: 'error',
                    message: ` Test failed: ${error.response?.data?.message || error.message}`,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    AI-Powered Website Testing
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Describe your test in natural language, let AI do the work
                </p>
            </div>

            {/* Main Form */}
            <div className="card fade-in">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                    Test Configuration
                </h2>

                <div className="space-y-4">
                    {/* URL Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Target URL
                        </label>
                        <input
                            type="url"
                            className="input-field"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Instruction */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Test Instruction
                        </label>
                        <textarea
                            className="textarea-field"
                            rows="4"
                            placeholder="Example: Navigate to the homepage, click on 'About Us', and verify the page contains the word 'Company'"
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Model Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                AI Model
                            </label>
                            <select
                                className="input-field"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={loading}
                            >
                                <option value="gemini">Google Gemini 2.5 Flash</option>
                                <option value="openai" disabled>
                                    OpenAI GPT-4 (Coming Soon)
                                </option>
                            </select>
                        </div>

                        {/* Browser Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Browser
                            </label>
                            <select
                                className="input-field"
                                value={browserType}
                                onChange={(e) => setBrowserType(e.target.value)}
                                disabled={loading}
                            >
                                <option value="chromium">🌐 Chromium</option>
                                <option value="firefox">🦊 Firefox</option>
                                <option value="webkit">🧭 WebKit (Safari)</option>
                            </select>
                        </div>

                        {/* Headless Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Browser Mode
                            </label>
                            <div className="flex items-center space-x-3 mt-3">
                                <input
                                    type="checkbox"
                                    id="headless"
                                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                                    checked={headless}
                                    onChange={(e) => setHeadless(e.target.checked)}
                                    disabled={loading}
                                />
                                <label htmlFor="headless" className="text-sm text-gray-700 dark:text-gray-300">
                                    Headless mode
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {loading && totalSteps > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Progress: Step {currentStep} of {totalSteps}</span>
                                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                            </div>
                            <div className="progress-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Execute Button */}
                    <button
                        onClick={handleExecute}
                        disabled={loading}
                        className={`w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            } btn-primary`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="spinner mr-3"></div>
                                Executing Test... {totalSteps > 0 ? `(${currentStep}/${totalSteps})` : ''}
                            </span>
                        ) : (
                            ' Execute Test'
                        )}
                    </button>
                </div>
            </div>

            {/* Live Logs */}
            {logs.length > 0 && (
                <div className="card fade-in">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                         Live Execution Logs
                    </h3>
                    <LogConsole logs={logs} />
                </div>
            )}

            {/* Screenshots */}
            {screenshots.length > 0 && (
                <div className="card fade-in">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                        📸 Screenshots
                    </h3>
                    <ScreenshotGallery screenshots={screenshots} />
                </div>
            )}

            {/* Result Summary */}
            {result && (
                <div className="card fade-in">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                         Test Completed
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Session ID:</strong> {result.sessionId}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Status:</strong>{' '}
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${result.finalStatus === 'success'
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                    : result.finalStatus === 'failed'
                                        ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                                    }`}
                            >
                                {result.finalStatus.toUpperCase()}
                            </span>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Summary:</strong> {result.summary}
                        </p>
                        <a
                            href={`/report/${result.sessionId}`}
                            className="inline-block btn-primary mt-4"
                        >
                            📄 View Full Report
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
