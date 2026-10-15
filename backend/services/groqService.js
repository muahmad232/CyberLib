const Groq = require('groq-sdk');
const Book = require('../models/book');
const Author = require('../models/author');
const User = require('../models/user');

const KNOWN_GENRES = [
  'philosophical fiction', 'historical', 'thriller', 'biography', 'self-help',
  'dystopian', 'horror', 'adventure', 'classic', 'satire', 'psychological drama',
  'philosophy', 'fiction', 'science fiction', 'fantasy', 'mystery', 'romance',
  'health', 'science', 'business', 'art', 'children', 'travel', 'religion', 'erotica',
  'sci-fi', 'dystopia', 'crime', 'poetry'
];

function removeEmojis(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{FE0E}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[ \t]{2,}/g, ' ');
}

const SYSTEM_PROMPT = `You are the "Keeper of Tales", the sentient, wise, and evocative literary companion of CyberLib—a cybernetic sanctuary for book lovers.

Your voice & demeanor:
- You speak with eloquence, warmth, and atmospheric literary charm (mystical yet grounded, poetic yet crystal clear).
- You are a true literary connoisseur: you can discuss everything from Homer, Shakespeare, Camus, Dostoevsky, and Tolstoy, to modern sci-fi, dark academia, cyberpunk, and obscure philosophical treatises.

CRITICAL FORMATTING & LENGTH DIRECTIVES:
1. STRICTLY NO EMOJIS: DO NOT use any emojis, pictographs, or emoji-like decorative icons under any circumstances. Never output emojis.
2. CONCISE LENGTH & COMPLETION (CRITICAL):
   - Keep your entire response focused, elegant, and between 160 and 280 words total.
   - DO NOT write overly long treatises or multi-page essays.
   - When providing a table, provide at most 1 single compact table with 3-4 rows maximum and brief cell descriptions.
   - ALWAYS complete your response with a clean, satisfying concluding sentence. Never leave sentences unfinished or cut off mid-thought.
3. AUTHOR DATASET GROUNDING (CRITICAL):
   - Whenever an author is present in [CYBERLIB DATABASE AUTHORS] or [CYBERLIB DATABASE BOOKS], NEVER say "there is no information regarding that author" or that they are missing from the dataset.
   - Confirm their presence in CyberLib's catalog, illuminate their core themes, and cite their books available in the library.
4. STRUCTURED HEADINGS: Organize responses using clean Markdown headings (##, ###) without emojis.
5. GROUNDED RECOMMENDATIONS:
   - When the user asks for recommendations based on their profile or personal tastes, ALWAYS consult the provided [USER PROFILE] (their interests, read books, wishlist) and recommend fitting books from the [CYBERLIB DATABASE BOOKS].
   - If the user asks for books in a specific genre or mood, prioritize the books listed in the [CYBERLIB DATABASE BOOKS], detailing why they fit.
   - If the user has read books, acknowledge their taste (e.g. "Seeing your reverence for [Book/Genre]...").
6. RICH BOOK DESCRIPTIONS & SUMMARIES:
   - When asked about a specific book, its plot, synopsis, or themes, give a captivating, spoiler-conscious description. Break down the premise, core conflict, philosophical undertones, and emotional mood in 2 concise paragraphs.
7. GENERAL QUESTIONS & TRIVIA:
   - Answer any literary questions with depth, elegance, and concise brilliance.`;

/**
 * Retrieve database context for RAG
 */
async function retrieveContext({ query, userId }) {
  const qLower = query.toLowerCase();
  let userContext = null;
  let matchingBooks = [];
  let matchingAuthors = [];
  let detectedGenre = null;

  // 1. Fetch User Profile
  if (userId) {
    try {
      const user = await User.findById(userId)
        .populate('readBooks.bookId', 'title genre authors rating')
        .populate('wishlist.bookId', 'title genre authors')
        .lean();

      if (user) {
        userContext = {
          name: user.name || user.username || 'Reader',
          interests: Array.isArray(user.interests) ? user.interests : [],
          readBooks: (user.readBooks || []).filter(rb => rb.bookId).map(rb => ({
            title: rb.bookId.title,
            genre: rb.bookId.genre,
            rating: rb.rating || 'read'
          })),
          wishlist: (user.wishlist || []).filter(w => w.bookId).map(w => ({
            title: w.bookId.title,
            genre: w.bookId.genre
          }))
        };
      }
    } catch (err) {
      console.warn('Context retrieval: could not fetch user profile:', err.message);
    }
  }

  // 2. Check if profile recommendations are requested
  const isProfileQuery = /\b(my profile|my interest|my taste|for me|recommend me|what should i read|next book|suggest (me|for me)|my reading|custom recommendation)\b/i.test(query);

  if (isProfileQuery && userContext && userContext.interests && userContext.interests.length > 0) {
    try {
      const interestRegexes = userContext.interests.map(i => new RegExp(`^${i}$`, 'i'));
      const booksByInterests = await Book.find({ genre: { $in: interestRegexes } })
        .sort({ averageRating: -1, rating: -1, reviewCount: -1 })
        .limit(6)
        .select('title authors publishedDate genre description rating averageRating reviewCount')
        .lean();
      matchingBooks.push(...booksByInterests);
    } catch (err) {
      console.warn('Context retrieval: error fetching books by user interests:', err.message);
    }
  }

  // 3. Genre detection
  for (const genre of KNOWN_GENRES) {
    if (qLower.includes(genre)) {
      detectedGenre = genre === 'sci-fi' ? 'science fiction' : (genre === 'dystopia' ? 'dystopian' : genre);
      break;
    }
  }

  if (detectedGenre) {
    try {
      const genreBooks = await Book.find({
        genre: { $regex: new RegExp(`^${detectedGenre}$`, 'i') }
      })
        .sort({ averageRating: -1, rating: -1, reviewCount: -1 })
        .limit(6)
        .select('title authors publishedDate genre description rating averageRating reviewCount')
        .lean();

      for (const b of genreBooks) {
        if (!matchingBooks.some(mb => mb._id.toString() === b._id.toString())) {
          matchingBooks.push(b);
        }
      }
    } catch (err) {
      console.warn('Context retrieval: error fetching genre books:', err.message);
    }
  }

  // 4. Smart Author detection & catalog book lookup
  let authorCandidate = query
    .replace(/\b(what|do you have|are there|any|books?|novels?|works?|by|written by|authored by|author|authors|in cyberlib|in library|in the library|in catalog|in the catalog|in the archives|in your archives|tell me about|who is|who was|give me|show me|a brief portrait of|portrait of|information on|bio of|biography of|can you|please|recommend|suggest)\b/gi, ' ')
    .replace(/[?!.,;:"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (authorCandidate.length >= 3) {
    try {
      const candidatePhrases = [
        authorCandidate,
        authorCandidate.split(/\s+/).slice(0, 2).join(' '),
        authorCandidate.split(/\s+/).slice(0, 3).join(' ')
      ].filter((p, idx, arr) => p.length >= 3 && arr.indexOf(p) === idx);

      for (const phrase of candidatePhrases) {
        if (matchingAuthors.length === 0) {
          const foundAuthors = await Author.find({
            name: { $regex: new RegExp(`\\b${phrase}\\b`, 'i') }
          })
            .limit(3)
            .select('name top_work bio subjects rating')
            .lean();

          if (foundAuthors.length > 0) {
            matchingAuthors.push(...foundAuthors);
          }
        }

        const foundBooksByAuthor = await Book.find({
          authors: { $elemMatch: { $regex: new RegExp(phrase, 'i') } }
        })
          .limit(6)
          .select('title authors publishedDate genre description rating averageRating reviewCount')
          .lean();

        for (const b of foundBooksByAuthor) {
          if (!matchingBooks.some(mb => mb._id.toString() === b._id.toString())) {
            matchingBooks.push(b);
          }
        }
      }

      // If still not found, test significant individual tokens (e.g. "Tolstoy", "Camus", "Orwell")
      if (matchingAuthors.length === 0) {
        const tokens = authorCandidate.split(/\s+/).filter(w => w.length >= 4 && !['about', 'brief', 'portrait', 'signature', 'themes', 'works', 'life', 'read', 'recommend'].includes(w.toLowerCase()));
        for (const token of tokens) {
          const tokenAuthors = await Author.find({ name: { $regex: new RegExp(`\\b${token}\\b`, 'i') } })
            .limit(2)
            .select('name top_work bio subjects rating')
            .lean();
          if (tokenAuthors.length > 0) {
            matchingAuthors.push(...tokenAuthors);
            break;
          }
        }
      }
    } catch (err) {
      console.warn('Context retrieval: error in author detection:', err.message);
    }
  }

  // If author found in Author collection, make sure their books in CyberLib are retrieved
  if (matchingAuthors.length > 0) {
    try {
      for (const author of matchingAuthors) {
        const authorBooks = await Book.find({
          authors: { $elemMatch: { $regex: new RegExp(author.name, 'i') } }
        })
          .limit(6)
          .select('title authors publishedDate genre description rating averageRating reviewCount')
          .lean();

        for (const b of authorBooks) {
          if (!matchingBooks.some(mb => mb._id.toString() === b._id.toString())) {
            matchingBooks.push(b);
          }
        }
      }
    } catch (err) {
      console.warn('Context retrieval: error fetching books by author:', err.message);
    }
  }

  // 5. Book Title / Description search
  const isDescriptionOrBookQuery = /\b(about|description|summary|synopsis|tell me about|what is|review of|plot|similar to|like)\b/i.test(query);
  if (isDescriptionOrBookQuery || matchingBooks.length === 0) {
    try {
      const foundBooks = await Book.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(3)
        .select('title authors publishedDate genre description rating averageRating reviewCount')
        .lean();

      for (const b of foundBooks) {
        if (!matchingBooks.some(mb => mb._id.toString() === b._id.toString())) {
          matchingBooks.push(b);
        }
      }
    } catch (err) {
      // Regex fallback if text search fails
      const cleanTitle = query.replace(/(tell me about|what is|describe|summary of|description of|similar to|books like)/gi, '').trim();
      if (cleanTitle.length > 2) {
        const titleBook = await Book.findOne({ title: { $regex: new RegExp(cleanTitle, 'i') } })
          .select('title authors publishedDate genre description rating averageRating reviewCount')
          .lean();
        if (titleBook && !matchingBooks.some(mb => mb._id.toString() === titleBook._id.toString())) {
          matchingBooks.push(titleBook);
        }
      }
    }
  }

  // 6. If still no books and general recommend request, fetch popular books
  if (matchingBooks.length === 0 && /\b(popular|best|recommend|suggest|top)\b/i.test(query)) {
    try {
      matchingBooks = await Book.find({ rating: { $gte: 4 } })
        .sort({ reviewCount: -1, averageRating: -1 })
        .limit(5)
        .select('title authors publishedDate genre description rating averageRating reviewCount')
        .lean();
    } catch (err) {
      // ignore
    }
  }

  return {
    userContext,
    detectedGenre,
    matchingBooks: matchingBooks.slice(0, 6),
    matchingAuthors: matchingAuthors.slice(0, 2)
  };
}

/**
 * Format context block into string for system prompt injection
 */
function formatContextPrompt({ userContext, detectedGenre, matchingBooks, matchingAuthors }) {
  const parts = [];

  if (userContext) {
    let uInfo = `[USER PROFILE]`;
    uInfo += `\nName: ${userContext.name}`;
    if (userContext.interests && userContext.interests.length > 0) {
      uInfo += `\nProfile Interests / Favorite Genres: ${userContext.interests.join(', ')}`;
    }
    if (userContext.readBooks && userContext.readBooks.length > 0) {
      uInfo += `\nBooks Read by User: ${userContext.readBooks.map(rb => `"${rb.title}" (${rb.genre || 'General'}, ${rb.rating}★)`).join(', ')}`;
    }
    if (userContext.wishlist && userContext.wishlist.length > 0) {
      uInfo += `\nWishlist: ${userContext.wishlist.map(w => `"${w.title}"`).join(', ')}`;
    }
    parts.push(uInfo);
  }

  if (detectedGenre) {
    parts.push(`[DETECTED GENRE IN QUERY]: ${detectedGenre}`);
  }

  if (matchingAuthors && matchingAuthors.length > 0) {
    let aInfo = `[CYBERLIB DATABASE AUTHORS]:`;
    for (const a of matchingAuthors) {
      aInfo += `\n- Name: ${a.name} | Top Work: ${a.top_work || 'N/A'} | Rating: ${a.rating ? a.rating + '/5' : 'N/A'} | Bio: ${a.bio || 'Author in CyberLib.'}`;
    }
    parts.push(aInfo);
  }

  if (matchingBooks && matchingBooks.length > 0) {
    let bInfo = `[CYBERLIB DATABASE BOOKS]:`;
    for (const b of matchingBooks) {
      const descSnippet = b.description ? b.description.replace(/\s+/g, ' ').slice(0, 220) + '...' : 'Available in CyberLib library.';
      bInfo += `\n- Title: "${b.title}" | Author(s): ${(b.authors || []).join(', ') || 'Unknown'} | Genre: ${b.genre || 'Uncategorized'} | Rating: ${b.rating || b.averageRating || 'Unrated'}★ | Description: ${descSnippet}`;
    }
    parts.push(bInfo);
  }

  return parts.join('\n\n');
}

/**
 * Graceful fallback response when GROQ_API_KEY is missing or API is unreachable
 */
function generateFallbackResponse({ query, userContext, detectedGenre, matchingBooks, matchingAuthors }) {
  if (matchingBooks && matchingBooks.length > 0) {
    let bookList = matchingBooks.map(b =>
      `**${b.title}** by *${(b.authors || []).join(', ') || 'Unknown'}* (${b.genre || 'Classic'})\n> ${b.description ? b.description.slice(0, 160) + '...' : 'A captivating journey through literature.'}`
    ).join('\n\n');

    if (userContext && userContext.interests && userContext.interests.length > 0) {
      return `*Greetings, ${userContext.name}.*\n\nLooking upon your scrolls, your spirit aligns with **${userContext.interests.join(', ')}**. Here are tales from the CyberLib archives curated for your journey:\n\n${bookList}\n\n*(Keeper's Note: Add your free \`GROQ_API_KEY\` to .env to unlock full conversational depth and dialogue!)*`;
    }

    if (detectedGenre) {
      return `*In the realm of ${detectedGenre}, the archives whisper of these tales:*\n\n${bookList}\n\n*(Keeper's Note: Add your free \`GROQ_API_KEY\` to .env for full conversational intelligence!)*`;
    }

    return `*Here are resonant tales from the CyberLib archives:*\n\n${bookList}\n\n*(Keeper's Note: Add your free \`GROQ_API_KEY\` to .env to converse freely with the Keeper of Tales!)*`;
  }

  if (matchingAuthors && matchingAuthors.length > 0) {
    const a = matchingAuthors[0];
    return `*Behold the chronicler ${a.name}:*\n\n**Top Work:** ${a.top_work || 'Master of prose'}\n**Rating:** ${a.rating || '5'}/5\n${a.bio ? `> ${a.bio}\n\n` : ''}*(Keeper's Note: Add your free \`GROQ_API_KEY\` to .env for full conversational intelligence!)*`;
  }

  return `*Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, your guide through the labyrinth of CyberLib.\n\nAsk me for book recommendations, descriptions of specific works, author lore, or genre recommendations.\n\n*(Keeper's Note: Add your free \`GROQ_API_KEY\` in .env to unlock the full power of Groq's Llama 3.3 LLM!)*`;
}

let cachedWorkingModel = null;

/**
 * Dynamically find the best available model for the user's Groq API key
 */
async function getAvailableModel(groq) {
  if (cachedWorkingModel) return cachedWorkingModel;
  try {
    const list = await groq.models.list();
    const availableIds = (list.data || []).map(m => m.id);
    const preferredModels = [
      'llama-3.3-70b-versatile',
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'llama-3.1-8b-instant',
      'openai/gpt-oss-20b'
    ];
    for (const pref of preferredModels) {
      if (availableIds.includes(pref)) {
        cachedWorkingModel = pref;
        return pref;
      }
    }
    const textModel = availableIds.find(id => !id.includes('whisper') && !id.includes('prompt-guard'));
    if (textModel) {
      cachedWorkingModel = textModel;
      return textModel;
    }
  } catch (err) {
    console.warn('Could not auto-list Groq models:', err.message);
  }
  return 'openai/gpt-oss-120b';
}

/**
 * Generate chat completion using Groq API + MongoDB RAG
 */
async function generateChatResponse({ message, userId, history = [] }) {
  // 1. Retrieve RAG context from MongoDB
  const contextData = await retrieveContext({ query: message, userId });
  const contextPrompt = formatContextPrompt(contextData);

  const apiKey = process.env.GROQ_API_KEY;

  // 2. If no API key configured, use graceful grounded fallback
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return generateFallbackResponse({
      query: message,
      userContext: contextData.userContext,
      detectedGenre: contextData.detectedGenre,
      matchingBooks: contextData.matchingBooks,
      matchingAuthors: contextData.matchingAuthors
    });
  }

  // 3. Initialize Groq SDK
  const groq = new Groq({ apiKey });

  // 4. Build message payload for Groq
  const messagesPayload = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\n=== RETRIEVED CYBERLIB CONTEXT ===\n${contextPrompt || 'No specific database records matched, but draw upon your extensive literary wisdom.'}\n==================================`
    }
  ];

  // Append recent chat history (up to last 6 messages) for multi-turn continuity
  const recentHistory = (history || []).slice(-6);
  for (const h of recentHistory) {
    if (h.sender && h.text) {
      messagesPayload.push({
        role: h.sender === 'bot' ? 'assistant' : 'user',
        content: h.text
      });
    }
  }

  // Append current user message
  messagesPayload.push({
    role: 'user',
    content: message
  });

  // 5. Query Groq with dynamic auto-detection and fallback list
  const primaryModel = await getAvailableModel(groq);
  const candidateModels = [
    primaryModel,
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-20b'
  ].filter((v, i, a) => a.indexOf(v) === i);

  for (const model of candidateModels) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95
      });

      const reply = response.choices?.[0]?.message?.content;
      if (reply && reply.trim()) {
        cachedWorkingModel = model;
        return removeEmojis(reply.trim());
      }
    } catch (err) {
      console.warn(`Groq model ${model} invocation attempt:`, err.message);
    }
  }

  // 6. If all cloud models failed or rate limited, deliver database-grounded response
  console.warn('All cloud Groq models failed or rate limited, falling back to database response.');
  return generateFallbackResponse({
    query: message,
    userContext: contextData.userContext,
    detectedGenre: contextData.detectedGenre,
    matchingBooks: contextData.matchingBooks,
    matchingAuthors: contextData.matchingAuthors
  });
}

module.exports = {
  generateChatResponse,
  retrieveContext
};
