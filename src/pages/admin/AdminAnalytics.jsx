import { useEffect, useState, useMemo } from 'react';
import api from '../../utils/axiosInstance';

export default function AdminAnalytics() {
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quizFilter, setQuizFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('');
  const [sortByScore, setSortByScore] = useState(false);

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/attempts'),
      api.get('/quizzes')
    ]).then(([a, q]) => {
      setAttempts(a.data);
      setQuizzes(q.data);
    }).finally(() => setLoading(false));
  }, []);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        quizId: quizFilter,
        startDate: dateFilter === 'custom' ? startDate : '',
        endDate: dateFilter === 'custom' ? endDate : '',
        email: emailFilter
      });
      if (dateFilter === 'today') {
        params.set('startDate', new Date().toISOString().split('T')[0]);
        params.set('endDate', new Date().toISOString().split('T')[0]);
      }
      
      const res = await api.get(`/admin/reports/analytics?${params.toString()}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizzy-analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate PDF report');
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setQuizFilter('all');
    setEmailFilter('');
    setSortByScore(false);
  };

  const filteredAttempts = useMemo(() => {
// ... (rest of memo remains same)
    let result = [...attempts];

    // Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        result = result.filter(a => new Date(a.createdAt).toDateString() === now.toDateString());
      } else if (dateFilter === 'week') {
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - 7);
        result = result.filter(a => new Date(a.createdAt) >= cutoff);
      } else if (dateFilter === 'month') {
        const cutoff = new Date();
        cutoff.setMonth(now.getMonth() - 1);
        result = result.filter(a => new Date(a.createdAt) >= cutoff);
      } else if (dateFilter === 'custom') {
        if (startDate) result = result.filter(a => new Date(a.createdAt) >= new Date(startDate));
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          result = result.filter(a => new Date(a.createdAt) <= end);
        }
      }
    }

    // Quiz Filter
    if (quizFilter !== 'all') {
      result = result.filter(a => a.quizId?._id === quizFilter);
    }

    // Email Filter
    if (emailFilter.trim()) {
      result = result.filter(a => a.userId?.email?.toLowerCase().includes(emailFilter.toLowerCase()));
    }

    // Sorting
    if (sortByScore) {
      result.sort((a, b) => b.percentage - a.percentage);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [attempts, dateFilter, quizFilter, emailFilter, sortByScore, startDate, endDate]);

  const stats = useMemo(() => {
    const total = filteredAttempts.length;
    const avg = total ? Math.round(filteredAttempts.reduce((acc, a) => acc + a.percentage, 0) / total) : 0;
    const highest = total ? Math.max(...filteredAttempts.map(a => a.percentage)) : 0;
    return { total, avg, highest };
  }, [filteredAttempts]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="analytics-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Advanced Platform Analytics</h1>
          <p className="page-subtitle">Detailed insights into quiz attempts and user performance</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-secondary" onClick={clearFilters}>↺ Reset</button>
          <button className="btn btn-primary" onClick={downloadPDF} disabled={downloading || filteredAttempts.length === 0}>
            {downloading ? '...' : '⬇ Download PDF Report'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--blue)' }}>
          <div className="stat-label">Total Filtered Attempts</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="stat-label">Average Percentage</div>
          <div className="stat-value">{stats.avg}%</div>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="stat-label">Highest Score</div>
          <div className="stat-value">{stats.highest}%</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          alignItems: 'flex-end' 
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: '.75rem', fontWeight: 600 }}>Period</label>
            <select className="form-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <>
              <div style={{ flex: '1 1 150px' }}>
                <label className="form-label" style={{ fontSize: '.75rem', fontWeight: 600 }}>From</label>
                <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label className="form-label" style={{ fontSize: '.75rem', fontWeight: 600 }}>To</label>
                <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </>
          )}
          
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: '.75rem', fontWeight: 600 }}>Quiz</label>
            <select className="form-select" value={quizFilter} onChange={e => setQuizFilter(e.target.value)}>
              <option value="all">All Quizzes</option>
              {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
            </select>
          </div>

          <div style={{ flex: '1 1 250px' }}>
            <label className="form-label" style={{ fontSize: '.75rem', fontWeight: 600 }}>Search User Email</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="user@example.com" 
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', paddingBottom: '.5rem' }}>
            <input 
              type="checkbox" 
              id="sortByScore" 
              checked={sortByScore} 
              onChange={e => setSortByScore(e.target.checked)} 
            />
            <label htmlFor="sortByScore" style={{ fontSize: '.85rem', cursor: 'pointer' }}>Show Highest Scores on Top</label>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>#</th>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>User Name</th>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>Quiz Name</th>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>Score</th>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>Result</th>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>Attempt Date</th>
                <th style={{ padding: '1rem', fontSize: '.85rem' }}>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.length > 0 ? filteredAttempts.map((a, i) => (
                <tr key={a._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '1rem', fontSize: '.85rem', color: 'var(--text3)' }}>{i + 1}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{a.userId?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{a.userId?.email}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '.85rem' }}>{a.quizId?.title || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      color: a.percentage >= 80 ? 'var(--green)' : a.percentage >= 50 ? 'var(--accent)' : 'var(--red)' 
                    }}>
                      {a.percentage}%
                    </span>
                    <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{a.score}/{a.totalQuestions}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${a.percentage >= 50 ? 'badge-low' : 'badge-advance'}`} style={{ 
                      background: a.percentage >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: a.percentage >= 50 ? 'var(--green)' : 'var(--red)',
                      border: 'none'
                    }}>
                      {a.percentage >= 50 ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '.85rem', color: 'var(--text2)' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                    <div style={{ fontSize: '.7rem' }}>{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '.85rem', color: 'var(--text2)' }}>
                    {Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)' }}>
                    No attempts found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover {
          background: var(--bg2);
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .analytics-container {
            padding-bottom: 2rem;
          }
        }
      `}} />
    </div>
  );
}
