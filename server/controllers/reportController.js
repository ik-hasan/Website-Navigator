import Report from '../models/Report.js';

/**
 * Get a specific report by session ID
 */
export const getReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findOne({ sessionId: id });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
};

/**
 * Get all reports (paginated)
 */
export const getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-stepsExecuted'); // Exclude detailed steps for list view

        const total = await Report.countDocuments();

        res.json({
            reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};
