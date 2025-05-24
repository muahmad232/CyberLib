import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import bannerImage from './banner.png';
import Chatbot from './Chatbot'; // Import the Chatbot component

const LandingPage = () => {
  const navigate = useNavigate();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <div className="landing-container">
      {/* Main Landing Content */}
      <div className="cyber-landing">
        {/* Hero Banner */}
        <section className="cyber-hero">
          <img 
            src={bannerImage} 
            alt="Cyberpunk digital library" 
            className="hero-image" 
          />
        </section>

        {/* Main Content */}
        <main className="cyber-content">
          <header className="content-header">
            <h1 className="title-glitch">CYBER_LIB</h1>
            <p className="subtitle-pulse">NEURAL NETWORK FOR LITERARY DISCOVERY</p>
          </header>

          <p className="content-description">
            <span className="text-glowing">Dive into the datastream</span> of digital literature, 
            where <span className="text-purple">quantum processors</span> meet{' '}
            <span className="text-green">ancient scrolls</span>.
          </p>

          <button className="cta-button" onClick={handleGetStarted}>
            <span className="button-label">INITIALIZE SYSTEM</span>
            <span className="button-hover-effect"></span>
          </button>
        </main>
      </div>

      {/* Chatbot Toggle Button */}
      <div className="chatbot-toggle" onClick={toggleChatbot}>
        <span className="chatbot-toggle-icon">💬</span>
      </div>

      {/* Chatbot Popup */}
      <div className={`chatbot-popup ${isChatbotOpen ? 'active' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">CYBER_ASSISTANT</div>
          <button className="close-chatbot" onClick={toggleChatbot}>×</button>
        </div>
        <Chatbot />
      </div>
    </div>
  );
};

export default LandingPage;