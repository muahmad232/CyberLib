import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../apiClient';
import ChatHistory from '../components/ChatHistory';
import './Chatbot.css';

/**
 * Strips all emojis and pictographs from text
 */
const removeEmojis = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{FE0E}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[ \t]{2,}/g, ' ');
};

/**
 * Formats inline markdown tokens: ***bold italic***, **bold**, __bold__, *italic*, _italic_, and `code`
 */
const parseInlineMarkdown = (text) => {
  if (!text) return '';
  const clean = removeEmojis(text);
  const parts = [];
  const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      parts.push(clean.substring(lastIndex, match.index));
    }
    if (match[2]) {
      // ***bold italic***
      parts.push(
        <strong key={match.index}>
          <em>{match[2]}</em>
        </strong>
      );
    } else if (match[3]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[3]}</strong>);
    } else if (match[4]) {
      // __bold__
      parts.push(<strong key={match.index}>{match[4]}</strong>);
    } else if (match[5]) {
      // *italic*
      parts.push(<em key={match.index}>{match[5]}</em>);
    } else if (match[6]) {
      // _italic_
      parts.push(<em key={match.index}>{match[6]}</em>);
    } else if (match[7]) {
      // `code`
      parts.push(
        <code 
          key={match.index} 
          style={{ 
            background: 'rgba(0, 255, 136, 0.12)', 
            border: '1px solid rgba(0, 255, 136, 0.3)',
            padding: '1px 6px', 
            borderRadius: '4px', 
            color: '#00ff88',
            fontFamily: 'inherit'
          }}
        >
          {match[7]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < clean.length) {
    parts.push(clean.substring(lastIndex));
  }

  return parts.length > 0 ? parts : clean;
};

/**
 * Parses multi-line markdown with headings, tables, blockquotes, lists, and horizontal rules
 */
const renderFormattedText = (rawText) => {
  if (!rawText) return null;
  const clean = removeEmojis(rawText);
  const lines = clean.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Table Detection: line has pipes and next line is a separator row
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-+:?\s*\|/.test(lines[i + 1].trim())
    ) {
      // Parse header row
      const headerCells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(c => c.trim());

      i += 2; // Skip header and separator

      // Parse data rows
      const dataRows = [];
      while (i < lines.length && lines[i].trim().includes('|') && !/^\s*\|?\s*:?-+:?\s*\|/.test(lines[i].trim())) {
        const rowCells = lines[i]
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(c => c.trim());
        dataRows.push(rowCells);
        i++;
      }

      elements.push(
        <div key={`table-${i}`} className="chat-table-wrapper">
          <table className="chat-table">
            <thead>
              <tr>
                {headerCells.map((h, hIdx) => (
                  <th key={hIdx}>{parseInlineMarkdown(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{parseInlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 2. Headings (H1 - H4)
    if (/^####\s+/.test(trimmed)) {
      elements.push(
        <h4 key={`h4-${i}`} className="chat-h4">
          {parseInlineMarkdown(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      elements.push(
        <h3 key={`h3-${i}`} className="chat-h3">
          {parseInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      elements.push(
        <h2 key={`h2-${i}`} className="chat-h2">
          {parseInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      i++;
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      elements.push(
        <h1 key={`h1-${i}`} className="chat-h1">
          {parseInlineMarkdown(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      i++;
      continue;
    }

    // 3. Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="chat-hr" />);
      i++;
      continue;
    }

    // 4. Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteContent = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote key={`quote-${i}`} className="chat-quote">
          {parseInlineMarkdown(quoteContent)}
        </blockquote>
      );
      i++;
      continue;
    }

    // 5. Bullet Lists
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[-*•]\s+/, '');
      elements.push(
        <div key={`bullet-${i}`} className="chat-bullet">
          <span className="bullet-dot">•</span>
          <span className="bullet-content">{parseInlineMarkdown(bulletContent)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 6. Numbered Lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+(.*)/);
      elements.push(
        <div key={`num-${i}`} className="chat-numbered">
          <span className="number-label">{match ? match[1] : '•'}</span>
          <span className="number-content">{parseInlineMarkdown(match ? match[2] : trimmed)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 7. Empty line spacer
    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="chat-spacer" />);
      i++;
      continue;
    }

    // 8. Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="chat-p">
        {parseInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return elements;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '*Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, your AI literary companion powered by Groq and CyberLib\'s living archives.\n\nAsk of me:\n\n- *Recommendations tailored to your profile & taste*\n- *Deep explorations & synopses of any book*\n- *Curated journeys across any genre or era*\n- *Portraits and top works of renowned authors*\n\nWhat calls to your soul today?',
      specialFormat: true
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatIdRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch chat history when chatId changes
  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    }
  }, [chatId]);

  const fetchChatMessages = async (id) => {
    try {
      const res = await apiClient.get(`/api/chat/${id}`);
      if (res.data && res.data.messages) {
        setMessages(res.data.messages.map(msg => ({
          sender: msg.sender,
          text: removeEmojis(msg.text),
          specialFormat: msg.sender === 'bot'
        })));
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const loadChat = (selectedChatId) => {
    chatIdRef.current = selectedChatId;
    setChatId(selectedChatId);
  };

  const startNewChat = () => {
    chatIdRef.current = null;
    setChatId(null);
    setMessages([{ 
      sender: 'bot', 
      text: '*Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, your AI literary companion powered by Groq and CyberLib\'s living archives.\n\nAsk of me:\n\n- *Recommendations tailored to your profile & taste*\n- *Deep explorations & synopses of any book*\n- *Curated journeys across any genre or era*\n- *Portraits and top works of renowned authors*\n\nWhat calls to your soul today?',
      specialFormat: true
    }]);
  };

  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const token = localStorage.getItem('token');
    const isLoggedIn = Boolean(token && token !== 'undefined' && token !== 'null' && token.trim() !== '');

    const userMessage = { 
      sender: 'user', 
      text: removeEmojis(trimmed),
      specialFormat: false 
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Authentication Guard
    if (!isLoggedIn) {
      const loginPromptMsg = {
        sender: 'bot',
        text: 'LOGIN FIRST\n\nYou must be logged in to chat with the Keeper of Tales and receive personalized literary guidance.',
        specialFormat: true,
        isLoginPrompt: true
      };
      setMessages(prev => [...prev, loginPromptMsg]);
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post('/api/chat/message', {
        message: trimmed,
        chatId: chatIdRef.current
      });

      if (res.data) {
        if (res.data.chatId && !chatIdRef.current) {
          chatIdRef.current = res.data.chatId;
          setChatId(res.data.chatId);
        }

        const botReply = removeEmojis(res.data.botMessage?.text || '*The archives resonate, yet words escape me...*');
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: botReply,
            specialFormat: true
          }
        ]);
      }
    } catch (err) {
      console.error('Error sending message to AI companion:', err);
      const errMsg = err.response?.data?.message || err.message;
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `*A disturbance echoes through the archives...*\n\nUnable to retrieve counsel at this moment (${errMsg}). Please try again shortly.`,
          specialFormat: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const token = localStorage.getItem('token');

  return (
    <div className="chatbot-page">
      {token && (
        <div className="sidebar">
          <button className="new-chat-button" onClick={startNewChat}>
            + New Conversation
          </button>
          <ChatHistory onSelectChat={loadChat} currentChatId={chatId} />
        </div>
      )}
      
      <div className="chatbot-container">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender}-message ${message.specialFormat ? 'special-format' : ''}`}
            >
              <div className="message-bubble">
                <div className="message-header">
                  <strong>{message.sender === 'bot' ? 'KEEPER OF TALES:' : 'YOU:'}</strong>
                </div>
                <div className="message-text">
                  {renderFormattedText(message.text)}
                </div>
                {message.isLoginPrompt && (
                  <div style={{ marginTop: '0.75rem', paddingLeft: '8px' }}>
                    <a 
                      href="/auth" 
                      style={{
                        display: 'inline-block',
                        padding: '0.45rem 1.25rem',
                        backgroundColor: '#ff007f',
                        color: '#ffffff',
                        border: '1px solid #ff007f',
                        borderRadius: '4px',
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        letterSpacing: '1px',
                        boxShadow: '0 0 15px rgba(255, 0, 127, 0.5)'
                      }}
                    >
                      LOGIN FIRST
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot-message special-format">
              <div className="message-bubble">
                <div className="message-header">
                  <strong>KEEPER OF TALES:</strong>
                </div>
                <div className="message-text">
                  <span className="bot-thinking">
                    Consulting the literary archives <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            value={userInput}
            disabled={isLoading}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isLoading ? "The Keeper is contemplating..." : "Whisper your query (e.g. recommend based on my profile, describe 1984, tell me about Camus)..."}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userInput.trim() && !isLoading) {
                sendMessage(userInput);
              }
            }}
          />
          <button 
            disabled={isLoading || !userInput.trim()} 
            onClick={() => sendMessage(userInput)}
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? '...' : 'SEND'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;