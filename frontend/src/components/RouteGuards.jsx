import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdvocate, isAdmin, isCitizen } from '../utils/roleUtils.js';

/**
 * Route guard for Citizen-only pages (/dashboard).
 * Unauthenticated -> /citizen/login
 * Advocate (advocate OR lawyer_advisor) -> /advocate/dashboard
 * Admin -> /admin
 */
export function CitizenRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/citizen/login" state={{ from: location }} replace />;
  }

  if (isAdvocate(role)) {
    return <Navigate to="/advocate/dashboard" replace />;
  }

  if (isAdmin(role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/**
 * Route guard for Advocate-only pages.
 * Accepts both "advocate" and "lawyer_advisor" role values.
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

  if (isCitizen(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAdmin(role)) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdvocate(role)) {
    // Unknown role — send to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Route guard for Admin-only pages (/admin).
 * Unauthenticated -> /login
 * Non-admin -> correct workspace
 */
export function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin(role)) {
    return <Navigate to={isAdvocate(role) ? '/advocate/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

