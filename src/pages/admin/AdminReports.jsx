import { useState } from 'react';
import api from '../../utils/axiosInstance';

const REPORTS = [
  {
    type: 'users',
    title: 'Registered Users',
    description: 'Full list of all registered users with join date and status.',
    icon: '👥'
  },
  {
    type: 'active-users',
    title: 'Active Users (Last 30 Days)',
    description: 'Users who have logged in during the past 30 days.',
    icon: '🟢'
  },
  {
    type: 'quiz-results',
    title: 'All Quiz Results',
    description: 'Complete list of quiz attempts — user, quiz, score, and date.',
    icon: '📊'
  },
  {
    type: 'leaderboard',
    title: 'Platform Leaderboard',
    description: 'Top 50 users ranked by average score across all quizzes.',
    icon: '🏆'
  },
  {
    type: 'summary',
    title: 'Platform Summary',
    description: 'High-level overview: total users, active users, quizzes, and attempts.',
    icon: '📋'
  }
];

const PERIOD_REPORTS = [
  {
    type: 'daily',
    title: 'Daily Attempted',
    description: 'Attempts generated over the last 24 hours.',
    icon: '📅'
  },
  {
    type: 'weekly',
    title: 'Weekly Attempted',
    description: 'Attempts generated over the last 7 days.',
    icon: '📆'
  },
  {
    type: 'monthly',
    title: 'Monthly Attempted',
    description: 'Attempts generated over the last 30 days.',
    icon: '🗓️'
  }
];

export default function AdminReports() {
  const [generating, setGenerating] = useState({});
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const generate = async (type, isPeriod = false, action = 'download', reportTitle = '') => {
    setGenerating(g => ({ ...g, [type]: true }));
    setErrors(e => ({ ...e, [type]: '' }));
    try {
      const endpoint = isPeriod ? `/admin/reports/period/${type}` : `/admin/reports/${type}`;
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      
      if (action === 'preview') {
        setPreviewUrl(url);
        setPreviewTitle(reportTitle);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizzy-${type}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setErrors(e => ({ ...e, [type]: 'Failed to generate report. Try again.' }));
    } finally {
      setGenerating(g => ({ ...g, [type]: false }));
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewTitle('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">PDF Reports</h1>
        <p className="page-subtitle">Generate and download platform reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {REPORTS.map(report => (
          <div key={report.type} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>{report.icon}</span>
              <div>
                <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)' }}>{report.title}</h3>
                <p style={{ fontSize: '.825rem', color: 'var(--text2)', marginTop: '.25rem', lineHeight: 1.5 }}>{report.description}</p>
              </div>
            </div>
            {errors[report.type] && (
              <div className="alert alert-error" style={{ padding: '.5rem .75rem', fontSize: '.8rem' }}>{errors[report.type]}</div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => generate(report.type, false, 'preview', report.title)}
                disabled={generating[report.type]}>
                {generating[report.type] ? '...' : '👁️ Preview'}
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => generate(report.type, false, 'download')}
                disabled={generating[report.type]}>
                {generating[report.type]
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /></>
                  : '⬇ PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' }}>Time-based Reports</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {PERIOD_REPORTS.map(report => (
          <div key={report.type} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--blue)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>{report.icon}</span>
              <div>
                <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)' }}>{report.title}</h3>
                <p style={{ fontSize: '.825rem', color: 'var(--text2)', marginTop: '.25rem', lineHeight: 1.5 }}>{report.description}</p>
              </div>
            </div>
            {errors[report.type] && (
              <div className="alert alert-error" style={{ padding: '.5rem .75rem', fontSize: '.8rem' }}>{errors[report.type]}</div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => generate(report.type, true, 'preview', report.title)}
                disabled={generating[report.type]}>
                {generating[report.type] ? '...' : '👁️ Preview'}
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => generate(report.type, true, 'download')}
                disabled={generating[report.type]}>
                {generating[report.type]
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /></>
                  : '⬇ PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem', background: 'var(--bg3)' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '.5rem' }}>📌 Report Notes</h3>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '.85rem', color: 'var(--text2)', lineHeight: 2 }}>
          <li>All reports are generated in real-time with current data.</li>
          <li>Quiz Results report includes the most recent 200 attempts.</li>
          <li>Leaderboard report shows top 50 users by average score.</li>
          <li>Reports can be previewed directly in your browser or downloaded as PDF files.</li>
        </ul>
      </div>

      {previewUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'white' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Preview: {previewTitle}</h2>
            <button className="btn btn-ghost" style={{ color: 'white' }} onClick={closePreview}>✕ Close</button>
          </div>
          <div style={{ flex: 1, background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
