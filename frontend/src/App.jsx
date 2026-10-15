import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import GenreSelectionPage from './pages/GenreSelectionPage';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import UserProfile from './pages/UserProfile'; 
import BookDetails from './pages/BookDetails'; // Import the BookDetails page
import Navbar from './components/Navbar';
import UserBooks from './pages/UserBooks';  
import Chatbot from './pages/Chatbot';
import ChatHistory from './components/ChatHistory';
import LandingPage from './pages/LandingPage';  // Import the new LandingPage
import AuthorDetails from './pages/AuthorDetails'; 
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <NavBarWithVisibility />
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/genres" element={<ProtectedRoute><GenreSelectionPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />
        <Route path="/author/:id" element={<ProtectedRoute><AuthorDetails /></ProtectedRoute>} />
        <Route path="/user/books" element={<ProtectedRoute><UserBooks /></ProtectedRoute>} /> 
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/chathistory" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function NavBarWithVisibility() {
  const location = useLocation();  // This should now be inside the Router

  const isLandingPage = location.pathname === "/"; // Check if it's the landing page

  return !isLandingPage ? <Navbar /> : null;  // Conditionally render Navbar
}


export default App;
