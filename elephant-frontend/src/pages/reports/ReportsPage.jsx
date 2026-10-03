import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { reportApi } from '../../api/reportApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Plus,
  FileText,
  Trash2,
  Eye,
  X,
  Loader2,
  ArrowLeft,
  Calendar,
  DollarSign,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate Report Modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('FINANCIAL');
  const [reportFormat, setReportFormat] = useState('TXT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [generating, setGenerating] = useState(false);

  // View Report Modal
  const [viewingReport, setViewingReport] = useState(null);
  const [deleteReportId, setDeleteReportId] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getReports();
      setReports(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load reports history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    if (searchParams.get('generate') === 'true') {
      setIsGenerateOpen(true);
    }
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');

    try {
      const generated = await reportApi.createReport({
        title: reportTitle.trim() || undefined,
        reportType,
        startDate: startDate || null,
        endDate: endDate || null,
        content: reportContent.trim() || undefined,
        format: reportFormat,
      });

      setIsGenerateOpen(false);
      setReportTitle('');
      setReportContent('');
      setStartDate('');
      setEndDate('');
      setReportFormat('TXT');
      await loadReports();
      // Open the freshly generated report view
      if (generated) {
        setViewingReport(generated);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    try {
      await reportApi.deleteReport(deleteReportId);
      setDeleteReportId(null);
      loadReports();
    } catch (e) {
      console.error(e);
      setError('Failed to delete report.');
    }
  };

  const isCsvContent = (report) => {
    if (!report || !report.content) return false;
    return report.content.startsWith('ID,') || report.content.startsWith('"ID"') || report.title?.toLowerCase().includes('csv');
  };

  const handleDownloadReport = (report) => {
    if (!report) return;
    const isCsv = isCsvContent(report);
    const mimeType = isCsv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
    const ext = isCsv ? 'csv' : 'txt';
    const blob = new Blob([report.content || ''], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${report.id}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/reports"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#2196F3',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Analytics Charts
        </Link>
      </div>

      <PageHeader
        title="Saved Reports Archive"
        subtitle="Generate and archive custom financial and event reports"
        action={
          <button
            onClick={() => setIsGenerateOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={18} /> Generate Report
          </button>
        }
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <LoadingSpinner message="Loading saved reports..." />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports saved"
            message="Generate a new report to automatically summarize your financial or event records."
            actionText="Generate Report"
            onAction={() => setIsGenerateOpen(true)}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #E2EAF3' }}>
                  <th style={{ padding: '14px 24px', fontWeight: 800, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Report Title</th>
                  <th style={{ padding: '14px 24px', fontWeight: 800, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '14px 24px', fontWeight: 800, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Date Range</th>
                  <th style={{ padding: '14px 24px', fontWeight: 800, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Generated On</th>
                  <th style={{ padding: '14px 24px', fontWeight: 800, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #EEF3F8' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0D2A5B' }}>
                      {r.title}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: r.reportType === 'FINANCIAL' ? '#E8F4FF' : '#DDF8F7',
                            color: r.reportType === 'FINANCIAL' ? '#2196F3' : '#088380',
                          }}
                        >
                          {r.reportType}
                        </span>
                        {isCsvContent(r) ? (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                            }}
                          >
                            CSV
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#F1F5F9',
                              color: '#64748B',
                            }}
                          >
                            TXT
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748B' }}>
                      {r.startDate ? `${formatDate(r.startDate)} - ${formatDate(r.endDate)}` : 'All Dates'}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748B' }}>
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setViewingReport(r)}
                          title="View Report Content"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            backgroundColor: '#E8F4FF',
                            border: '1px solid #D0E8FF',
                            color: '#2196F3',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => setDeleteReportId(r.id)}
                          title="Delete Report"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '10px',
                            backgroundColor: '#FFE8F1',
                            border: '1px solid #FFCCD8',
                            color: '#EF4444',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {isGenerateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 42, 91, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsGenerateOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(13, 42, 91, 0.25)',
              border: '1px solid #E2EAF3',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #EEF3F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                  Generate Custom Report
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>
                  Auto-compiles records and financial totals from your active data
                </p>
              </div>
              <button
                onClick={() => setIsGenerateOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Monthly Expense Audit / Q3 Financial Summary"
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2EAF3',
                    backgroundColor: '#F8FAFD',
                    fontSize: '0.9rem',
                    color: '#0D2A5B',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                  Report Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2EAF3',
                    fontSize: '0.9rem',
                    color: '#0D2A5B',
                    backgroundColor: '#F8FAFD',
                    outline: 'none',
                  }}
                >
                  <option value="FINANCIAL">Financial Expense & Bill Summary</option>
                  <option value="EVENT">Event Schedule & Attendance Report</option>
                  <option value="GENERAL">General Overview Summary</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                  Output Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReportFormat('TXT')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: reportFormat === 'TXT' ? '2px solid #2196F3' : '1.5px solid #E2EAF3',
                      backgroundColor: reportFormat === 'TXT' ? '#F0F7FF' : '#F8FAFD',
                      color: reportFormat === 'TXT' ? '#2196F3' : '#64748B',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FileText size={16} /> Text Summary (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFormat('CSV')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: reportFormat === 'CSV' ? '2px solid #10B981' : '1.5px solid #E2EAF3',
                      backgroundColor: reportFormat === 'CSV' ? '#ECFDF5' : '#F8FAFD',
                      color: reportFormat === 'CSV' ? '#059669' : '#64748B',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FileSpreadsheet size={16} /> CSV Spreadsheet (.csv)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2EAF3',
                      backgroundColor: '#F8FAFD',
                      fontSize: '0.85rem',
                      color: '#0D2A5B',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2EAF3',
                      backgroundColor: '#F8FAFD',
                      fontSize: '0.85rem',
                      color: '#0D2A5B',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                  Custom Notes / Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Leave empty to automatically compile records from database..."
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2EAF3',
                    backgroundColor: '#F8FAFD',
                    fontSize: '0.85rem',
                    color: '#0D2A5B',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #E2EAF3',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: generating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.4)',
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...
                    </>
                  ) : (
                    'Generate & Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {viewingReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 42, 91, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setViewingReport(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(13, 42, 91, 0.25)',
              border: '1px solid #E2EAF3',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #EEF3F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                  {viewingReport.title}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2196F3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {viewingReport.reportType} REPORT
                </span>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.825rem', color: '#64748B' }}>
                <span>Created: <strong style={{ color: '#0D2A5B' }}>{formatDateTime(viewingReport.createdAt)}</strong></span>
                {viewingReport.startDate && (
                  <span>Period: <strong style={{ color: '#0D2A5B' }}>{formatDate(viewingReport.startDate)} - {formatDate(viewingReport.endDate)}</strong></span>
                )}
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFD',
                  border: '1.5px solid #E2EAF3',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.85rem',
                  color: '#0D2A5B',
                  lineHeight: 1.5,
                  maxHeight: '340px',
                  overflowY: 'auto',
                }}
              >
                {viewingReport.content}
              </div>
            </div>

            <div style={{ padding: '16px 28px', backgroundColor: '#F8FAFD', borderTop: '1px solid #EEF3F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => handleDownloadReport(viewingReport)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: isCsvContent(viewingReport) ? '1.5px solid #10B981' : '1.5px solid #E2EAF3',
                  color: isCsvContent(viewingReport) ? '#059669' : '#2196F3',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isCsvContent(viewingReport) ? (
                  <>
                    <FileSpreadsheet size={14} color="#10B981" /> Download .csv
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download .txt
                  </>
                )}
              </button>

              <button
                onClick={() => setViewingReport(null)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteReportId}
        title="Delete Report"
        message="Are you sure you want to delete this saved report?"
        onConfirm={handleDeleteReport}
        onCancel={() => setDeleteReportId(null)}
      />
    </div>
  );
};
