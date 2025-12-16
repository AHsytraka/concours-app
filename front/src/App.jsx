import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import { Loader } from './components/common';

// Public Pages
import Home from './pages/public/Home';

// Auth Pages
import Login from './pages/auth/Login';
import StudentRegister from './pages/auth/StudentRegister';
import UniversityRegister from './pages/auth/UniversityRegister';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentCourseRegistrations from './pages/student/CourseRegistrations';
import StudentEventRegister from './pages/student/StudentEventRegister';

// University Pages
import UniversityDashboard from './pages/university/Dashboard';
import UniversityEvents from './pages/university/Events';
import UniversityEventCreate from './pages/university/EventCreate';
import UniversityEventDetail from './pages/university/EventDetail';
import UniversityEventEdit from './pages/university/EventEdit';
import UniversityRegistrations from './pages/university/Registrations';
import UniversityDossiers from './pages/university/Dossiers';
import UniversityGrades from './pages/university/Grades';
import UniversityResults from './pages/university/Results';
import UniversityStatistics from './pages/university/Statistics';
import UniversitySettings from './pages/university/Settings';
import UniversityUsers from './pages/university/Users';
import UniversitySubAccounts from './pages/university/SubAccounts';
import Unauthorized from './pages/Unauthorized';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, pageName }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Chargement..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // Show unauthorized page instead of redirecting
    return <Unauthorized requiredRole={allowedRoles} currentPage={pageName} />;
  }

  return children;
};

// Public Route - Redirects authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Chargement..." />;
  }

  if (isAuthenticated) {
    // CONTEST_MANAGER should go to grades page only
    if (hasRole(['CONTEST_MANAGER'])) {
      return <Navigate to="/university/grades" replace />;
    }
    if (hasRole(['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN'])) {
      return <Navigate to="/university" replace />;
    }
    return <Navigate to="/student" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={<Navigate to="/register/student" replace />} 
      />
      <Route 
        path="/register/student" 
        element={
          <PublicRoute>
            <StudentRegister />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register/university" 
        element={
          <PublicRoute>
            <UniversityRegister />
          </PublicRoute>
        } 
      />

      {/* Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/events" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/registrations" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentCourseRegistrations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/register-event/:eventId" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentEventRegister />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/profile" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfile />
          </ProtectedRoute>
        } 
      />

      {/* University Routes */}
      <Route 
        path="/university" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Tableau de bord">
            <UniversityDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/events" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Concours">
            <UniversityEvents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/events/create" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Créer un concours">
            <UniversityEventCreate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/events/:id" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Détail du concours">
            <UniversityEventDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/events/:id/edit" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Modifier le concours">
            <UniversityEventEdit />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/registrations" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Inscriptions">
            <UniversityRegistrations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/dossiers" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Sélection de dossiers">
            <UniversityDossiers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/grades" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN', 'CONTEST_MANAGER']} pageName="Saisie des notes">
            <UniversityGrades />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/results" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Résultats">
            <UniversityResults />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/statistics" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Statistiques">
            <UniversityStatistics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/settings" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Paramètres">
            <UniversitySettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/users" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Candidats">
            <UniversityUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/university/accounts" 
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']} pageName="Sous-comptes">
            <UniversitySubAccounts />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
