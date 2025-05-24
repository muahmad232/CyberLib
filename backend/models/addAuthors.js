const axios = require('axios');
const mongoose = require('mongoose');
const Author = require('./author.js');

const MONGO_URI = 'mongodb://localhost:27017/library';

// List of famous authors you want to fetch
const FAMOUS_AUTHORS = [
  'Friedrich Nietzsche',
  'Fyodor Dostoyevsky',
  'Albert Camus',
  'Collen Hoover',
  'Charles Bukowski',
  'Frank Herbert',
  'Marie Lu'
];

async function fetchAndInsertAuthors() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const authorName of FAMOUS_AUTHORS) {
      try {
        // First search for the author to get their key
        const searchUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(authorName)}`;
        const searchResponse = await axios.get(searchUrl);
        
        if (!searchResponse.data.docs || searchResponse.data.docs.length === 0) {
          console.log(`Author not found: ${authorName}`);
          continue;
        }

        // Get the first matching author
        const author = searchResponse.data.docs[0];
        const authorKey = author.key.replace('/authors/', '');

        // Skip if authorKey is missing
        if (!authorKey) {
          console.log(`Skipping author with missing key: ${authorName}`);
          continue;
        }

        // Check if author already exists in DB
        const existingAuthor = await Author.findOne({ openlibrary_key: authorKey });
        if (existingAuthor) {
          console.log(`Author already exists: ${authorName}`);
          continue;
        }

        // Fetch full author details
        const fullAuthorUrl = `https://openlibrary.org/authors/${authorKey}.json`;
        const fullAuthorRes = await axios.get(fullAuthorUrl);
        const fullAuthorData = fullAuthorRes.data;

        const authorData = {
          name: fullAuthorData.name || author.name || authorName,
          birth_date: fullAuthorData.birth_date || '',
          death_date: fullAuthorData.death_date || '',
          top_work: author.top_work || '',
          work_count: author.work_count || 0,
          bio: (typeof fullAuthorData.bio === 'object') ? fullAuthorData.bio.value : fullAuthorData.bio || '',
          openlibrary_key: authorKey
        };

        // Insert one at a time with error handling
        try {
          await Author.create(authorData);
          console.log(`Successfully inserted author: ${authorData.name}`);
        } catch (insertError) {
          if (insertError.code === 11000) {
            console.log(`Duplicate skipped: ${authorData.name}`);
          } else {
            console.error(`Error inserting author ${authorData.name}:`, insertError.message);
          }
        }

      } catch (err) {
        console.error(`Error processing author ${authorName}: ${err.message}`);
      }
    }

    console.log('Author insertion process completed.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

fetchAndInsertAuthors();