import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token && token !== 'undefined' && token !== 'null' && token.trim() !== '');

  if (!isLoggedIn) {
    return (
      <div className="login-required-overlay">
        <div className="login-required-card">
          <div className="login-required-icon">🔒</div>
          <h2 className="login-required-title">LOGIN FIRST</h2>
          <p className="login-required-text">
            Access Restricted: You must be logged in to view this page and explore CyberLib.
          </p>
          <div className="login-required-actions">
            <button 
              onClick={() => navigate('/auth')} 
              className="login-required-btn primary"
            >
              LOGIN FIRST
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="login-required-btn secondary"
            >
              HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
