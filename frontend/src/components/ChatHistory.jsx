//ChatHistory.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';
import './ChatHistory.css'; // Use the same theme

const groupChatsByDate = (chats) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const yesterdayStart = todayStart - oneDayMs;
  const lastWeekStart = todayStart - (7 * oneDayMs);

  const groups = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': []
  };

  chats.forEach((chat) => {
    const chatTime = new Date(chat.createdAt).getTime();
    if (chatTime >= todayStart) {
      groups['Today'].push(chat);
    } else if (chatTime >= yesterdayStart) {
      groups['Yesterday'].push(chat);
    } else if (chatTime >= lastWeekStart) {
      groups['Previous 7 Days'].push(chat);
    } else {
      groups['Older'].push(chat);
    }
  });

  return groups;
};

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

  const grouped = groupChatsByDate(chats);

  return (
    <div className="chat-history">
      <h2>📜 Past Conversations</h2>
      {Object.entries(grouped).map(([label, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={label} className="chat-history-group">
            <h3 className="chat-group-heading">{label}</h3>
            <ul>
              {items.map((chat) => {
                const lastUserMsg = chat.messages?.filter(m => m.sender === 'user').slice(-1)[0];
                const rawSnippet = lastUserMsg?.text || chat.messages?.[0]?.text || 'New conversation';
                const cleanSnippet = rawSnippet.replace(/[*_#`~]/g, '').trim();
                const formattedTime = new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <li 
                    key={chat._id} 
                    className={chat._id === currentChatId ? 'active' : ''}
                    onClick={() => loadChat(chat)}
                  >
                    <p><strong>{formattedTime}</strong></p>
                    <p className="snippet">
                      {cleanSnippet.length > 55 ? `${cleanSnippet.slice(0, 55)}...` : cleanSnippet}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default ChatHistory;
