import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllReports } from '../services/api';

function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });

    useEffect(() => {
        fetchReports();
    }, [pagination.page]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await getAllReports(pagination.page);
            setReports(response.data.reports);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            success: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'
                    }`}
            >
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">Test Reports</h1>
                <Link to="/" className="btn-primary">
                    + New Test
                </Link>
            </div>

            {/* Reports Table */}
            <div className="card">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No reports found</p>
                        <Link to="/" className="btn-primary mt-4 inline-block">
                            Create Your First Test
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Session ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Model
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reports.map((report) => (
                                        <tr
                                            key={report.sessionId}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {report.sessionId.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <a
                                                    href={report.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-600 hover:underline"
                                                >
                                                    {report.url.length > 40
                                                        ? report.url.substring(0, 40) + '...'
                                                        : report.url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {report.model}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(report.finalStatus)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {formatDate(report.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    to={`/report/${report.sessionId}`}
                                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                                >
                                                    View Report →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="mt-6 flex justify-center space-x-2">
                                <button
                                    onClick={() =>
                                        setPagination((p) => ({ ...p, page: p.page - 1 }))
                                    }
                                    disabled={pagination.page === 1}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-700">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() =>
                                        setPagination((p) => ({ ...p, page: p.page + 1 }))
                                    }
                                    disabled={pagination.page === pagination.pages}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Reports;
