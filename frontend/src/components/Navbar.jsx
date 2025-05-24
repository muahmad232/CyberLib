import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const navButtonStyle = {
    display: 'inline-block',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#0f0f0f',
    color: '#00ffcc',
    border: '1px solid #00ffcc',
    borderRadius: '4px',
    fontFamily: "'Courier New', Courier, monospace",
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textDecoration: 'none',
    textShadow: '0 0 5px rgba(0, 255, 204, 0.5)',
    boxShadow: '0 0 10px rgba(0, 255, 204, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    margin: '0 0.5rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const hoverStyle = {
    backgroundColor: '#00ffcc',
    color: '#0f0f0f',
    boxShadow: '0 0 20px rgba(0, 255, 204, 0.8)',
    textShadow: 'none'
  };

  return (
    <nav style={{
      backgroundColor: '#0a0a0a',
      padding: '1rem 2rem',
      borderBottom: '1px solid #00ffcc',
      boxShadow: '0 0 25px rgba(0, 255, 204, 0.4)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <Link 
          to="/dashboard" 
          style={{
            color: '#00ffcc',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(0, 255, 204, 0.7)',
            letterSpacing: '2px',
            textDecoration: 'none'
          }}
        >
          CYBER_LIB
        </Link>

        <div style={{ display: 'flex' }}>
          {[
            { path: '/auth', name: localStorage.getItem('token') ? 'LOGOUT' : 'LOGIN' },
            { path: '/search', name: 'SEARCH' },
            { path: '/profile', name: 'PROFILE' },
            { path: '/user/books', name: 'YOUR BOOKS' },
            { path: '/chatbot', name: 'CHATBOT' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={navButtonStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = navButtonStyle.backgroundColor;
                e.currentTarget.style.color = navButtonStyle.color;
                e.currentTarget.style.boxShadow = navButtonStyle.boxShadow;
                e.currentTarget.style.textShadow = navButtonStyle.textShadow;
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;