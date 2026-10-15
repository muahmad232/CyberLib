//ChatHistory.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';
import './ChatHistory.css'; // Use the same theme

const ChatHistory = ({ onSelectChat, currentChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chat history when component mounts or active chat changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await apiClient.get('/api/chat');
        setChats(res.data || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Could not fetch chat logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [currentChatId]);

  // Handle loading a specific chat session
  const loadChat = (chat) => {
    if (onSelectChat) {
      onSelectChat(chat._id);
    }
  };

  if (loading) return <p>Loading chat history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (chats.length === 0) return <p>No previous chats found.</p>;

  return (
    <div className="chat-history">
      <h2>📜 Past Conversations</h2>
      <ul>
        {chats.map((chat) => {
          const lastUserMsg = chat.messages?.filter(m => m.sender === 'user').slice(-1)[0];
          const rawSnippet = lastUserMsg?.text || chat.messages?.[0]?.text || 'New conversation';
          const cleanSnippet = rawSnippet.replace(/[*_#`~]/g, '').trim();

          return (
            <li 
              key={chat._id} 
              className={chat._id === currentChatId ? 'active-chat-item' : ''}
              onClick={() => loadChat(chat)}
            >
              <p><strong>{new Date(chat.createdAt).toLocaleString()}</strong></p>
              <p className="snippet">
                {cleanSnippet.length > 55 ? `${cleanSnippet.slice(0, 55)}...` : cleanSnippet}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatHistory;
