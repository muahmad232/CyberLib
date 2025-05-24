import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', username: '', password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Clear the token and user data on component mount
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'username') {
    // Allow only letters, numbers, dots, and underscores
    const cleanedValue = value.replace(/[^a-zA-Z0-9._]/g, '');
    setFormData({ ...formData, [name]: cleanedValue });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isSignIn) {
    const { email, password, username } = formData;

    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    const emailParts = email.split('@');
    if (
      emailParts.length !== 2 ||
      !allowedDomains.includes(emailParts[1].toLowerCase())
    ) {
      setMessage('Email must be a valid Gmail, Yahoo, or Outlook address.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage('Password must be at least 8 characters long and include a number and a special character.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9._]*$/;
    if (!usernameRegex.test(username)) {
      setMessage('Username can only contain letters, numbers, dots, and underscores, and must not start with a symbol or space.');
      return;
    }
  }

  const endpoint = isSignIn ? '/api/auth/login' : '/api/auth/signup';

  try {
    const res = await axios.post(`http://localhost:5000${endpoint}`, formData);

    setMessage(res.data.message);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    if (res.data.user.interests && res.data.user.interests.length >= 3) {
      navigate('/dashboard');
    } else {
      navigate('/genres', { state: { userId: res.data.user._id } });
    }
  } catch (err) {
    setMessage(err.response?.data?.message || 'An error occurred');
  }
};


  

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
        {!isSignIn && (
          <>
            <input name="name" onChange={handleChange} placeholder="Name" required />
            <input name="email" onChange={handleChange} placeholder="Email" required />
          </>
        )}
        <input name="username" onChange={handleChange} placeholder="Username" required />
        <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
        <button type="submit">{isSignIn ? 'Login' : 'Register'}</button>
        <p>{message}</p>
        <span onClick={() => setIsSignIn(!isSignIn)}>
          {isSignIn ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
        </span>
      </form>
    </div>
  );
}

export default AuthForm;
