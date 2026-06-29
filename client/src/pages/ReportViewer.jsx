import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getReport } from "../services/api";

function ReportViewer() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await getReport(id);
      setReport(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setError(error.response?.data?.error || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <Link to="/reports" className="btn-primary inline-block">
          Back to Reports
        </Link>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
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
        <h1 className="text-4xl font-bold text-white">Test Report</h1>
        <div className="space-x-3">
          <button onClick={handleDownloadPDF} className="btn-secondary">
            📥 Download PDF
          </button>
          <Link to="/reports" className="btn-primary">
            ← Back to Reports
          </Link>
        </div>
      </div>

      {/* Report Summary */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Report Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Session ID</p>
            <p className="font-mono text-gray-900">{report.sessionId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            {getStatusBadge(report.finalStatus)}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Target URL</p>
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              {report.url}
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Created At</p>
            <p className="text-gray-900">{formatDate(report.createdAt)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Instruction</p>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {report.instruction}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Model</p>
            <p className="text-gray-900 capitalize">{report.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Browser Mode</p>
            <p className="text-gray-900">
              {report.headless ? "Headless" : "Headed"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Summary</p>
            <p className="text-gray-900">{report.summary}</p>
          </div>
        </div>
      </div>

      {/* Execution Steps */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Execution Steps
        </h2>
        <div className="space-y-6">
          {report.stepsExecuted.map((step, index) => (
            <div
              key={index}
              className={`border-l-4 pl-6 py-4 ${
                step.status === "success"
                  ? "border-green-500 bg-green-50"
                  : step.status === "failed"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-500 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Step {index + 1}: {step.action.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(step.timestamp)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    step.status === "success"
                      ? "bg-green-200 text-green-800"
                      : step.status === "failed"
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {step.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {step.url && (
                  <p className="text-gray-700">
                    <strong>URL:</strong> {step.url}
                  </p>
                )}
                {step.selector && (
                  <p className="text-gray-700">
                    <strong>Selector:</strong>{" "}
                    <code className="bg-white px-2 py-1 rounded">
                      {step.selector}
                    </code>
                  </p>
                )}
                {step.value && (
                  <p className="text-gray-700">
                    <strong>Value:</strong> {step.value}
                  </p>
                )}
                {step.keyword && (
                  <p className="text-gray-700">
                    <strong>Keyword:</strong> {step.keyword}
                  </p>
                )}
                {step.error && (
                  <p className="text-red-700">
                    <strong>Error:</strong> {step.error}
                  </p>
                )}
              </div>

              {step.screenshotPath && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Screenshot:</p>
                  <img
                    src={`http://localhost:5000${step.screenshotPath}`}
                    alt={`Step ${index + 1} screenshot`}
                    className="border rounded-lg shadow-md max-w-full hover:scale-105 transition-transform cursor-pointer"
                    onClick={() =>
                      window.open(
                        `http://localhost:5000${step.screenshotPath}`,
                        "_blank",
                      )
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportViewer;
