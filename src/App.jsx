import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, ThemeToggle } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { Login, Register } from './pages/Auth';
import AuthDebug from './components/AuthDebug';
import UserDashboard from './pages/user/Dashboard';
import QuizList from './pages/user/QuizList';
import QuizAttempt from './pages/user/QuizAttempt';
import { Result, History } from './pages/user/ResultHistory';
import Rankings from './pages/user/Rankings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminScores from './pages/admin/AdminScores';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className="mobile-topbar">
        <span className="mobile-topbar-title">⚡ Quizzy</span>
        <button className="btn btn-icon btn-ghost" onClick={() => setMobileOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Backdrop for mobile sidebar */}
      <div className={`sidebar-backdrop ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}></div>

      <div className="app-body">
        <Sidebar mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
        <main className="main-content">{children}</main>
      </div>
      {/* <ThemeToggle /> */}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* User routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="/quizzes" element={
            <ProtectedRoute><AppLayout><QuizList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/quiz/:id" element={
            <ProtectedRoute><AppLayout><QuizAttempt /></AppLayout></ProtectedRoute>
          } />
          <Route path="/result/:id" element={
            <ProtectedRoute><AppLayout><Result /></AppLayout></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><AppLayout><History /></AppLayout></ProtectedRoute>
          } />
          <Route path="/rankings" element={
            <ProtectedRoute><AppLayout><Rankings /></AppLayout></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/quizzes" element={
            <ProtectedRoute adminOnly><AppLayout><AdminQuizzes /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/scores" element={
            <ProtectedRoute adminOnly><AppLayout><AdminScores /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute adminOnly><AppLayout><AdminReports /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly><AppLayout><AdminAnalytics /></AppLayout></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', color: 'var(--text2)' }}>
              <div style={{ fontSize: '4rem' }}>404</div>
              <p>Page not found</p>
              <a href="/login" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
      {/* <AuthDebug /> */}
    </AuthProvider>
  );
}
