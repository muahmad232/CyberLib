# Cyber Lib - Personalized Book Discovery Platform

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Technologies Used](#technologies-used)
* [Installation](#installation)
* [Usage](#usage)
* [API Integrations](#api-integrations)
* [Architecture & Design](#architecture--design)
* [UI/UX Details](#uiux-details)
* [Challenges Faced](#challenges-faced)
* [Limitations](#limitations)
* [Future Enhancements](#future-enhancements)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## Project Overview

**Cyber Lib** is a modern web-based platform designed to help users discover books tailored to their interests. It offers personalized book recommendations, user profiles to track reading preferences, interactive chatbot assistance, and a cyber-themed, engaging user interface. The system leverages powerful APIs like Google Books and Open Library to provide comprehensive book data, ensuring a rich user experience.

---

## Features

* Personalized book recommendations based on user preferences
* Advanced search by title, author, and genre
* User registration, login, and profile management
* Interactive chatbot for book suggestions and assistance
* Book and author rating & review system
* Trending and popular books display
* Responsive and visually appealing cyber-themed UI

---

## Technologies Used

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT)
* **APIs:** Google Books API, Open Library API
* **Others:** Multer for file uploads, Cloudinary for media storage (if used)

---

## Installation

### Prerequisites

* Node.js (v14 or above)
* MongoDB (local or cloud instance)
* npm or yarn package manager

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/muahmad/CyberLib.git
cd cyber-lib
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Setup environment variables:

Create a `.env` file in the backend folder with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

5. Start the backend server:

```bash
cd ../backend
node server.js
```

6. Start the frontend development server:

```bash
cd ../frontend
npm start
```

7. Fetch Books and Author:
   
```bash
cd ../backend/models
node fetchbooks.js
```
9. Open `http://localhost:3000` in your browser.

---

## Usage

* Register or log in to create your personalized profile.
* Select your preferred genres to get tailored book recommendations.
* Use the search bar to find books or authors by name.
* Interact with the chatbot to receive dynamic book suggestions.
* Rate and review books you've read.
* View trending books and authors on your dashboard.

---

## API Integrations

* **Google Books API:** Used to fetch detailed book metadata and cover images.
* **Open Library API:** Provides additional book and author information.

APIs are accessed via backend endpoints to ensure security and caching.

---

## Architecture & Design

The application is built as a **MERN** stack app (MongoDB, Express.js, React.js, Node.js):

* **Frontend:** React handles UI rendering, state management, and API calls. Tailwind CSS provides a sleek cyber-themed design.
* **Backend:** Express.js handles RESTful API requests, user authentication with JWT, and integrates external book APIs.
* **Database:** MongoDB stores user profiles, preferences, reviews, and internal book/author data.

---

## UI/UX Details

* Cyberpunk-inspired theme with neon colors and dark backgrounds.
* Responsive design optimized for desktop and mobile devices.
* Interactive components like chatbot and rating stars enhance engagement.
* Clean layout with intuitive navigation and accessibility features.

*Add snapshots here to showcase different screens.*

---

## Challenges Faced

* Efficiently integrating multiple book data APIs with varying data formats.
* Implementing a chatbot that provides meaningful book recommendations.
* Optimizing MongoDB queries and indexing for quick search performance.
* Designing a consistent cyber-themed UI without compromising usability.

---

## Limitations

* Chatbot uses rule-based logic, lacking AI-driven natural language understanding.
* Some book metadata is incomplete due to external API limitations.
* Scalability for large user base and massive book databases requires further optimization.

---

## Future Enhancements

* Integrate AI-powered recommendation engine and chatbot.
* Add social features like book clubs and friend recommendations.
* Implement offline reading lists and synchronization.
* Expand author profiles with biographies and interviews.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---
## License
This project is licensed under the MIT License.
