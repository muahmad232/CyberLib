//ChatHistory.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ChatHistory.css'; // Use the same theme

const ChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // To store the loaded chat's messages

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/chat', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(res.data || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Could not fetch chat logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  // Handle loading a specific chat session
  const loadChat = (chat) => {
    setActiveChat(chat.messages); // Set active chat messages to display
  };

  if (loading) return <p>Loading chat history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (chats.length === 0) return <p>No previous chats found.</p>;

  return (
    <div className="chat-history">
      

      {/* Display selected chat below history */}
      {activeChat && (
        <div className="active-chat">
          <h3>Selected Conversation:</h3>
          {activeChat.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}-message`}>
              <p>
                <strong>{msg.sender === 'bot' ? 'KEEPER OF TALES:' : 'YOU:'}</strong>
                <span>{msg.text}</span>
              </p>
            </div>
          ))}
        </div>
      )}


        <h2>📜 Past Conversations</h2>
        <ul>
        {chats.map((chat) => (
          <li key={chat._   } onClick={() => loadChat(chat)}>
            <p><strong>{new Date(chat.createdAt).toLocaleString()}</strong></p>
            <p className="snippet">
              {chat.messages[0]?.text.slice(0, 60)}...
            </p>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default ChatHistory;
