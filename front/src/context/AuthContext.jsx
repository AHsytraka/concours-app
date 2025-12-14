import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const ROLES = {
  STUDENT: 'STUDENT',
  UNIVERSITY_ADMIN: 'UNIVERSITY_ADMIN',
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  CONTEST_MANAGER: 'CONTEST_MANAGER',
  JURY_MEMBER: 'JURY_MEMBER'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to load user:', err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [token, clearAuth]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined' && token) {
      try {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setLoading(false);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
        loadUser();
      }
    } else {
      if (storedUser === 'undefined') {
        localStorage.removeItem('user');
      }
      loadUser();
    }
  }, [token, loadUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, email: userEmail, role, firstName, lastName } = response.data;
      
      // Build user object from response
      const userData = { 
        email: userEmail, 
        role, 
        firstName, 
        lastName,
        name: `${firstName} ${lastName}`.trim()
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Échec de la connexion';
      setError(message);
      throw new Error(message);
    }
  };

  const registerStudent = async (studentData, transcriptFile) => {
    try {
      setError(null);
      const formData = new FormData();
      
      Object.keys(studentData).forEach(key => {
        formData.append(key, studentData[key]);
      });
      
      if (transcriptFile) {
        formData.append('transcript', transcriptFile);
      }

      const response = await api.post('/auth/register/student', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || "Échec de l'inscription";
      setError(message);
      throw new Error(message);
    }
  };

  const registerUniversity = async (universityData, documents) => {
    try {
      setError(null);
      const formData = new FormData();

      Object.keys(universityData).forEach(key => {
        formData.append(key, universityData[key]);
      });

      if (documents) {
        Object.keys(documents).forEach(key => {
          formData.append(key, documents[key]);
        });
      }

      const response = await api.post('/auth/register/university', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || "Échec de l'inscription";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    // user.role is a single string from backend, not an array
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  const isStudent = useCallback(() => hasRole(ROLES.STUDENT), [hasRole]);
  const isUniversityAdmin = useCallback(() => hasRole(ROLES.UNIVERSITY_ADMIN), [hasRole]);
  const isContestManager = useCallback(() => hasRole(ROLES.CONTEST_MANAGER), [hasRole]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    registerStudent,
    registerUniversity,
    hasRole,
    isStudent,
    isUniversityAdmin,
    isContestManager,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
