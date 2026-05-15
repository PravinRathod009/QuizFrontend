import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosInstance';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/quizzes/${id}`), api.get(`/quizzes/${id}/questions`)])
      .then(([q, qs]) => {
        setQuiz(q.data);
        setQuestions(qs.data);
        setTimeLeft(q.data.timer * 60);
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load quiz.'));
  }, [id]);

  const submit = useCallback(async (force = false) => {
    if (submitting) return;
    if (!force && Object.keys(answers).length < questions.length) {
      const unanswered = questions.length - Object.keys(answers).length;
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({ questionId: q._id, selected: answers[q._id] || null }));
      const timeTaken = quiz ? quiz.timer * 60 - timeLeft : 0;
      const { data } = await api.post('/attempts/submit', { quizId: id, answers: payload, timeTaken });
      navigate(`/result/${data.attempt._id}`, { state: { attempt: data.attempt, correctAnswers: data.correctAnswers, questions } });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.');
      setSubmitting(false);
    }
  }, [answers, questions, quiz, timeLeft, id, navigate, submitting]);

  useEffect(() => {
    if (!timeLeft || !quiz) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); submit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [quiz, submit]);

  if (error) return <div className="alert alert-error" style={{ margin: '2rem' }}>{error}</div>;
  if (!quiz || !questions.length) return <div className="loading-center"><div className="spinner" /></div>;

  const q = questions[current];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isRed = timeLeft < 60;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{quiz.title}</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: '.15rem' }}>Question {current + 1} of {questions.length}</p>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 700, color: isRed ? 'var(--red)' : 'var(--green)', background: isRed ? 'var(--red-dim)' : 'var(--green-dim)', padding: '.3rem .9rem', borderRadius: 'var(--radius)', border: `1px solid ${isRed ? 'var(--red)' : 'var(--green)'}` }}>
          {mins}:{secs}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 4, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width .3s', borderRadius: 99 }} />
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.7, marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', marginRight: '.5rem' }}>{current + 1}.</span>
          {q.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {Object.entries(q.options).map(([key, value]) => {
            const selected = answers[q._id] === key;
            return (
              <button key={key} onClick={() => setAnswers(a => ({ ...a, [q._id]: key }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem',
                  background: selected ? 'var(--accent-dim)' : 'var(--bg3)',
                  border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--text)', fontSize: '.9rem', transition: 'all .15s', width: '100%'
                }}>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--text3)', minWidth: 20 }}>{key}</span>
                {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-ghost" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Prev</button>
        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', justifyContent: 'center', flex: 1, margin: '0 1rem' }}>
          {questions.map((qq, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{
                width: 28, height: 28, borderRadius: 4, border: '1px solid',
                borderColor: i === current ? 'var(--accent)' : answers[qq._id] ? 'var(--green)' : 'var(--border)',
                background: i === current ? 'var(--accent-dim)' : answers[qq._id] ? 'var(--green-dim)' : 'transparent',
                color: i === current ? 'var(--accent)' : answers[qq._id] ? 'var(--green)' : 'var(--text2)',
                fontSize: '.75rem', fontFamily: 'var(--mono)', cursor: 'pointer'
              }}>{i + 1}</button>
          ))}
        </div>
        {current < questions.length - 1
          ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
          : <button className="btn btn-success" onClick={() => submit(false)} disabled={submitting}>
              {submitting ? <><span className="spinner" />Submitting…</> : 'Submit Quiz ✓'}
            </button>
        }
      </div>
    </div>
  );
}
