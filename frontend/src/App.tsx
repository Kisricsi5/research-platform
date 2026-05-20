import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import BrowseProfessorsPage from './pages/shared/BrowseProfessorsPage';
import BrowseProjectsPage from './pages/shared/BrowseProjectsPage';
import ProfessorPublicProfilePage from './pages/shared/ProfessorProfilePage';
import ProjectDetailPage from './pages/shared/ProjectDetailPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import ApplyPage from './pages/student/ApplyPage';

// Professor pages
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import ProfessorProfilePage from './pages/professor/ProfessorProfilePage';
import ProjectsManagementPage from './pages/professor/ProjectsManagementPage';
import ProjectFormPage from './pages/professor/ProjectFormPage';
import ApplicationsManagementPage from './pages/professor/ApplicationsManagementPage';
import ApplicationDetailPage from './pages/professor/ApplicationDetailPage';
import { PageSpinner } from './components/ui/Spinner';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'STUDENT' | 'PROFESSOR' }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard'} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard'} /> : <SignupPage />} />
      <Route path="/professors" element={<BrowseProfessorsPage />} />
      <Route path="/professors/:id" element={<ProfessorPublicProfilePage />} />
      <Route path="/projects" element={<BrowseProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />

      {/* Student routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="STUDENT"><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute role="STUDENT"><ApplicationsPage /></ProtectedRoute>} />
      <Route path="/student/applications/:id" element={<ProtectedRoute role="STUDENT"><ApplicationsPage /></ProtectedRoute>} />
      <Route path="/student/apply/:projectId" element={<ProtectedRoute role="STUDENT"><ApplyPage /></ProtectedRoute>} />
      <Route path="/student/apply" element={<ProtectedRoute role="STUDENT"><ApplyPage /></ProtectedRoute>} />

      {/* Professor routes */}
      <Route path="/professor/dashboard" element={<ProtectedRoute role="PROFESSOR"><ProfessorDashboard /></ProtectedRoute>} />
      <Route path="/professor/profile" element={<ProtectedRoute role="PROFESSOR"><ProfessorProfilePage /></ProtectedRoute>} />
      <Route path="/professor/projects" element={<ProtectedRoute role="PROFESSOR"><ProjectsManagementPage /></ProtectedRoute>} />
      <Route path="/professor/projects/new" element={<ProtectedRoute role="PROFESSOR"><ProjectFormPage /></ProtectedRoute>} />
      <Route path="/professor/projects/:projectId/edit" element={<ProtectedRoute role="PROFESSOR"><ProjectFormPage /></ProtectedRoute>} />
      <Route path="/professor/applications" element={<ProtectedRoute role="PROFESSOR"><ApplicationsManagementPage /></ProtectedRoute>} />
      <Route path="/professor/applications/:id" element={<ProtectedRoute role="PROFESSOR"><ApplicationDetailPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
