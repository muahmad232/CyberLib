import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatHistory from '../components/ChatHistory';  // Import ChatHistory
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '🌌 *Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, a guide through the labyrinth of literature.\n\nAsk, and I shall reveal:\n\n✨ *Books that dance with the stars*\n🔥 *Stories that burn like embers*\n🌙 *Verses that whisper in the dark*\n\nWhat calls to your soul today?',
      specialFormat: true
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatId, setChatId] = useState(null);


  const genres = [
    'philosophical fiction',
    'historical',
    'thriller',
    'biography',
    'self-help',
    'dystopian',
    'horror',
    'adventure',
    'classic',
    'satire',
    'psychological drama',
    'philosophy',
    'Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Biography',
    'History',
    'Romance',
    'Horror',
    'Self-Help',
    'Health',
    'Science',
    'Business',
    'Art',
    'Children',
    'Travel',
    'Religion',
    'Erotica'
  ];

  const authors = [
    'Friedrich Nietzsche', 'Fyodor Dostoyevsky', 'Albert Camus', 'Colleen Hoover', 
    'Charles Bukowski', 'Frank Herbert Hayward', 'Marie Lu', 'George Orwell', 'J.K. Rowling', 
    'Stephen King', 'Leo Tolstoy', 'Jane Austen', 'Mark Twain Media', 'Haruki Murakami', 
    'Gabriel Garcia Marquez', 'J.R.R. Tolkien', 'Agatha Christie', 'William Shakespeare', 
    'Homer H. Hickam', 'Ernest Hemingway', 'Virginia Woolf', 'Isaac Asimov', 'John Steinbeck', 
    'George R.R. Martin', 'Kurt Vonnegut', 'Toni Morrison', 'H. G. Wells Society', 'Ray Bradbury', 
    'Douglas Adams', 'Margaret Atwood', 'Khaled Hosseini', 'John Green', 'F. Scott Fitzgerald', 
    'Oscar Wilde', 'Maya Angelou', 'Arthur C. Clarke', 'C.S. Lewis', 'Joseph Conrad', 'Dan Brown', 
    'Emily Dickinson', 'Vladimir Nabokov', 'Sylvia Plath', 'William Faulkner', 'Jack Kerouac', 
    'Herman Melville', 'J.D. Salinger', 'Charles Dickens', 'Società Dante Alighieri', 'Marcel Proust', 
    'William Golding', 'Chimamanda Ngozi Adichie', 'Jodi Picoult', 'James Patterson Jr.', 'Neil Gaiman', 
    'Danielle Steel', 'Nicholas Sparks', 'E.L. James', 'Ken Follett', 'Paulo Coelho Netto', 'Harper Lee', 
    'Lisa Gardner', 'Patricia Cornwell', 'Stephenie Meyer', 'Richard Adams', 'Ruth Ware', 'Tom Clancy', 
    'Elena Ferrante', 'David Baldacci', 'Anne Rice', 'Dean Koontz', 'Sandra Brown', 'Karin Slaughter', 
    'Michael Connelly', 'Tana French', 'Greg Iles', 'Kate Morton', 'Catherine Coulter', 'Jeffrey Archer', 
    'Lee Child', 'John Grisham', 'David Foster Wallace', 'Michael Crichton', 'Nelson De Mille', 'David Mitchell', 
    'Shirley Jackson', 'Rachel Carson', 'Margaret Mitchell', 'Leonard Cohen', 'Jack London', 'Beryl Bainbridge', 
    'Zadie Smith', 'Ruth Rendell', 'Alice Munro', 'Elif Şafak', 'Jamaica Kincaid', 'Roald Dahl', 'Walt Whitman', 
    'Jean-Paul Sartre', 'E.M. Forster', 'James Joyce', 'Dorothy Parker', 'Henry James', 'Caitlin Moran', 'Philip K. Dick', 
    'Ayn Rand', 'Arthur Miller', 'Harlan Coben', 'Liane Moriarty', 'Margaret Drabble', 'William Somerset Maugham', 
    'Christopher Marlowe', 'Bram Stoker', 'Mary Shelley', 'Louise Erdrich', 'Paul Auster'
  ];

  // Fetch chat history when component mounts
  useEffect(() => {
    if (chatId) {
      // If there's a chatId, update chat messages
      fetchChatMessages(chatId);
    }
  }, [chatId]);

  // Function to fetch messages for a specific chat
  const fetchChatMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.messages) {
        setMessages(res.data.messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          specialFormat: msg.sender === 'bot' // Format bot messages
        })));
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  // Function to load a specific chat
  const loadChat = (selectedChatId) => {
    setChatId(selectedChatId);
  };

  const saveMessageToBackend = async (sender, text) => {
    try {
      const token = localStorage.getItem('token');
      
      // Debugging: Log chatId and the message being sent
      console.log('Saving message to backend...');
      console.log('Sender:', sender);
      console.log('Text:', text);
      console.log('Current chatId:', chatId); // Log the chatId here
  
      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { sender, text, chatId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // Debugging: Log the response from the backend
      console.log('Response from backend:', res.data);
  
      // If no chatId exists (i.e., the first message), store the new session ID
      if (!chatId && res.data._id) {
        console.log('New chat session created. Storing chatId:', res.data._id);
        setChatId(res.data._id); // Store the new session ID
      }
    } catch (err) {
      console.error('Error saving message:', err.response?.data || err.message);
    }
  };
  
  const sendMessage = async (message) => {
    // Debugging: Log the user's message and chatId before sending
    console.log('User message received:', message);
    console.log('Current chatId before sending user message:', chatId); // Log the chatId here
  
    const userMessage = { 
      sender: 'user', 
      text: message,
      specialFormat: false 
    };
  
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
  
    console.log('Saving user message to backend...');
    await saveMessageToBackend('user', message); // Save user message to backend
  
    const query = message.toLowerCase();
    let response;
    let isSpecialFormat = true;
  
    const isAuthorSearch = query.includes('books by') || query.includes('author') || query.includes('written by');
    const matchedGenre = genres.find((genre) => query.includes(genre.toLowerCase()));
    const isSimilarBooksRequest = query.includes('similar') || query.includes('like') || query.includes('related') || query.includes('closest');
    const isGeneralBookRequest = (query.includes('recommend') && query.includes('book')) || (query.includes('suggest') && query.includes('book')) || (query.includes('popular') && query.includes('book'));
    const isGeneralAuthorRequest = (query.includes('recommend') && query.includes('author')) || (query.includes('suggest') && query.includes('author')) || (query.includes('popular') && query.includes('author'));
  
    console.log('Processing user query:', query);
  
    if (isSimilarBooksRequest) {
      const bookTitle = getBookTitleFromQuery(query);
      if (bookTitle) {
        response = await fetchSimilarBooks(bookTitle);
      } else {
        response = '🔮 *Tell me which book you are referring to...*\n\nTry asking for *"Books similar to [book title]"* or *"Books like [book title]"*.'; 
      }
    } else if (isGeneralBookRequest) {
      response = await fetchPopularBooks();
    } else if (isGeneralAuthorRequest) {
      response = await fetchPopularAuthors();
    } else if (isAuthorSearch) {
      const authorName = findAuthorInQuery(query);
      if (authorName) {
        response = await fetchBooksByAuthor(authorName);
      } else {
        response = '🔮 *The name slips through my fingers like sand...*\n\nSpeak again, and let me hear the *true name* of the author you seek.';
      }
    } else if (matchedGenre) {
      response = await fetchRecommendations(matchedGenre);
    } else {
      const authorName = findAuthorInQuery(query);
      if (authorName) {
        response = await fetchBooksByAuthor(authorName);
      } else {
        response = '📜 *The universe of books unfolds before you...*\n\nAsk for:\n\n🌠 *"Books that taste of stardust and sorrow"*\n⚔️ *"Tales of war and whispered secrets"*\n🖋️ *"The ink-stained dreams of Haruki Murakami"*';
      }
    }
  
    console.log('Bot response:', response);
  
    const botMessage = {
      sender: 'bot',
      text: response,
      specialFormat: isSpecialFormat
    };
  
    setMessages(prev => [...prev, botMessage]);
  
    // Debugging: Log chatId before sending bot's reply
    console.log('Saving bot message to backend...');
    console.log('Current chatId before saving bot message:', chatId); // Log the chatId here
    await saveMessageToBackend('bot', response); // Save bot message to backend
  };
  
  const findAuthorInQuery = (query) => {
    for (const author of authors) {
      if (query.includes(author.toLowerCase())) {
        return author;
      }
    }

    for (const author of authors) {
      const authorParts = author.split(' ');
      for (const part of authorParts) {
        if (part.length >= 4 && query.includes(part.toLowerCase())) {
          return author;
        }
      }
    }
    return null;
  };

  const getBookTitleFromQuery = (query) => {
    const match = query.match(/(similar to|like|related to|closest to) (.*)/);
    return match ? match[2].trim() : null;
  };

  const fetchRecommendations = async (genre) => {
    const lines = [
      'a timeless tale', 'a story for the ages', 'an ageless masterpiece',
      'a classic of its kind', 'a tale that never fades', 'a work beyond time',
      'a story waiting to be rediscovered', 'an eternal adventure',
      'a journey through time and imagination', 'a narrative for the soul'
    ];

    try {
      const res = await axios.get(`http://localhost:5000/api/chatbot/recommendations?genre=${genre}`);
      const books = res.data || [];
      if (!books.length) return `🌑 *The ${genre} shelf lies empty...*`;

      const getLine = () => lines[Math.floor(Math.random() * lines.length)];
      const bookList = books.map(b => `📖 *${b.title}* — ${b.year || getLine()}`).join('\n');
      return `🌠 *In the realm of ${genre}, I found these...*\n\n${bookList}`;
    } catch (err) {
      return '⚡ *The library trembles...*';
    }
  };

  const fetchBooksByAuthor = async (author) => {
    const lines = [
      'an untold year', 'a year yet to be written', 'a chapter unwritten in time',
      'a forgotten year', 'a year that never was'
    ];

    try {
      const res = await axios.get(`http://localhost:5000/api/chatbot/author?author=${encodeURIComponent(author)}`);
      const books = res.data || [];
      if (!books.length) return `🌫️ *The echoes of ${author} fade...*`;

      const getLine = () => lines[Math.floor(Math.random() * lines.length)];
      const bookList = books.map(b => `📜 *${b.title}* — ${b.year || getLine()}`).join('\n');
      return `🖋️ *Behold, the works of ${author}:*\n\n${bookList}`;
    } catch (err) {
      return '🌪️ *The ink bleeds, the pages flutter...*';
    }
  };

  const fetchSimilarBooks = async (bookTitle) => {
    const lines = [
      'a timeless tale', 'a story for the ages', 'a classic of its kind',
      'an eternal adventure', 'a journey through time and imagination'
    ];

    try {
      const res = await axios.get(`http://localhost:5000/api/chatbot/similar-books?title=${encodeURIComponent(bookTitle)}`);
      const books = res.data || [];
      if (!books.length) return `🌑 *I couldn't find any similar books to ${bookTitle}...*`;

      const getLine = () => lines[Math.floor(Math.random() * lines.length)];
      const bookList = books.map(b => `📖 *${b.title}* — ${b.year || getLine()}`).join('\n');
      return `🌠 *Here are some books similar to ${bookTitle}:*\n\n${bookList}`;
    } catch (err) {
      return '⚡ *The library trembles...*';
    }
  };

  const fetchPopularBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/popular-books');
      const books = res.data || [];
      if (!books.length) return `📚 *The shelves of renown are momentarily bare...*`;

      const bookList = books.map(b => `📘 *${b.title}* — ⭐ ${b.readCount} reads, 💖 ${b.wishCount} wishes`).join('\n');
      return `🔥 *These books burn bright with fame:*\n\n${bookList}`;
    } catch (err) {
      return '🚫 *I could not fetch popular books right now...*';
    }
  };

  const fetchPopularAuthors = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/popular-authors');
    const authors = res.data?.data || [];
    
    if (!authors.length) {
      return `🖋️ *The storytellers are hidden in shadow...*`;
    }

    const list = authors.map(a =>
      `👤 *${a.name}*\n📘 _Top Work:_ ${a.top_work}\n⭐ _Rating:_ ${a.rating}/5\n`
    ).join('\n');

    return `📖 *Here are authors the realm reveres:*\n\n${list}`;
  } catch (err) {
    return '🚫 *I could not fetch popular authors right now...*';
  }
};


  // Function to start a new chat
  const startNewChat = () => {
    setChatId(null);
    setMessages([{ 
      sender: 'bot', 
      text: '🌌 *Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, a guide through the labyrinth of literature.\n\nAsk, and I shall reveal:\n\n✨ *Books that dance with the stars*\n🔥 *Stories that burn like embers*\n🌙 *Verses that whisper in the dark*\n\nWhat calls to your soul today?',
      specialFormat: true
    }]);
  };

  const token = localStorage.getItem('token');

return (
  <div className="chatbot-page">
    {token && (
      <div className="sidebar">
        <button className="new-chat-button" onClick={startNewChat}>
          ✨ New Conversation
        </button>
        <ChatHistory onSelectChat={loadChat} currentChatId={chatId} />
      </div>
    )}
    
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}-message ${message.specialFormat ? 'special-format' : ''}`}>
            <p>
              <strong>{message.sender === 'bot' ? 'KEEPER OF TALES:' : 'YOU:'}</strong>
              <span style={{ whiteSpace: 'pre-line' }}>{message.text}</span>
            </p>
          </div>
        ))}
      </div>

        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Whisper your query..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userInput.trim()) sendMessage(userInput);
            }}
          />
          <button onClick={() => userInput.trim() && sendMessage(userInput)}>SEND</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;