import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2 } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('revenue');
  const [timeframe, setTimeframe] = useState('this-month');
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setSuccessMsg('');

    setTimeout(() => {
      setIsGenerating(false);
      setSuccessMsg(`Academix Pro Report successfully generated in ${format.toUpperCase()} format!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1800);
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#1d4ed8" />
            Generate Custom Report
          </div>
          <button type="button" onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Report Ready!</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Report Category</label>
              <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="revenue">Monthly Revenue & Payment Trends</option>
                <option value="students">Student Enrollments & Expirations</option>
                <option value="complaints">Customer Complaints & Resolution Audit</option>
                <option value="calls">Customer Service Call Logs & Performance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timeframe</label>
              <select className="form-select" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">Last 30 Days (Current Month)</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="year-to-date">Year to Date (2026)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Export Format</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
                  PDF Document
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="radio" name="format" value="excel" checked={format === 'excel'} onChange={() => setFormat('excel')} />
                  Excel Spreadsheet
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
                  CSV Data
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button type="button" onClick={onClose} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.875rem', color: '#64748b' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isGenerating}>
                <Download size={16} />
                {isGenerating ? 'Compiling Report...' : 'Download Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
