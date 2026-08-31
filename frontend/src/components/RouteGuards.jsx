import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guard for Citizen-only pages (/dashboard).
 * Unauthenticated -> /citizen/login
 * Advocate -> /advocate/dashboard
 * Admin -> /admin
 */
export function CitizenRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/citizen/login" state={{ from: location }} replace />;
  }

  if (role === 'advocate') {
    return <Navigate to="/advocate/dashboard" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/**
 * Route guard for Advocate-only pages (/advocate/dashboard, /advocate/onboarding).
 * Unauthenticated -> /advocate/login
 * Citizen -> /dashboard
 * Admin -> /admin
 */
export function AdvocateRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/advocate/login" state={{ from: location }} replace />;
  }

  if (role === 'citizen') {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/**
 * Route guard for Admin-only pages (/admin).
 * Unauthenticated -> /login
 * Non-admin -> /dashboard or /advocate/dashboard
 */
export function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    return <Navigate to={role === 'advocate' ? '/advocate/dashboard' : '/dashboard'} replace />;
  }

  return children;
}
