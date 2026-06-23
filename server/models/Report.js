import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['navigate', 'click', 'type', 'verify', 'wait']
    },
    selector: String,
    value: String,
    url: String,
    keyword: String,
    status: {
        type: String,
        enum: ['success', 'failed', 'skipped'],
        default: 'success'
    },
    screenshotPath: String,
    error: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const reportSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    url: {
        type: String,
        required: true
    },
    instruction: {
        type: String,
        required: true
    },
    model: {
        type: String,
        default: 'gemini'
    },
    headless: {
        type: Boolean,
        default: true
    },
    stepsExecuted: [stepSchema],
    finalStatus: {
        type: String,
        enum: ['success', 'failed', 'partial'],
        default: 'success'
    },
    summary: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Report', reportSchema);
