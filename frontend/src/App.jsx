import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
function App() {
  return (
    <Router>
      <NavBarWithVisibility />
      <Routes>
      <Route path="/" element={<LandingPage />} /> 
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/genres" element={<GenreSelectionPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/book/:id" element={<BookDetails />} /> {/* Dynamic route for book details */}
        <Route path="/author/:id" element={<AuthorDetails />} />
        <Route path="/user/books" element={<UserBooks />} /> 
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/chathistory" element={<ChatHistory />} />
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
