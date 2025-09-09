# Who Wants to Be a Millionaire Quiz Game

A modern web-based implementation of the classic "Who Wants to Be a Millionaire" TV show quiz game. Built with React and Node.js, featuring authentic gameplay mechanics and lifelines.

## Features

- **Authentic Quiz Experience** - Faithful recreation of the TV show format
- **Progressive Difficulty** - Questions get harder as you climb the money ladder
- **Three Lifelines** - 50:50, Phone a Friend, and Ask the Audience
- **Secure Session Management** - Each game session is isolated and secure
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Timer** - 60-second countdown for each question

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/REDLANTERNDEV/millionaire-quiz.git
   cd millionaire-quiz
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   ```

   The API server will run on `http://localhost:3000`

2. **Start the frontend development server** (in a new terminal)

   ```bash
   cd frontend
   npm run dev
   ```

   The web application will be available at `http://localhost:5173`

## How to Play

1. **Start a Game** - The application automatically creates a secure session
2. **Answer Questions** - Choose from 4 multiple-choice options
3. **Use Lifelines** - Each lifeline can only be used once per game:
   - **50:50** - Removes two incorrect answers
   - **Phone a Friend** - Get a hint from a virtual friend
   - **Ask the Audience** - See poll results from the audience
4. **Climb the Ladder** - Progress through 13 questions to win the top prize
5. **Beat the Clock** - You have 60 seconds per question (except the first)

## Security & Architecture

This application implements enterprise-grade security practices suitable for web applications:

### Session Management

Every game creates a unique, cryptographically secure session that expires after 2 hours. This ensures each player has an isolated gaming experience without interference from other users.

### Rate Protection

Built-in rate limiting prevents abuse by restricting each IP address to 60 requests per minute. This protects the server from spam attacks while allowing normal gameplay.

### Origin Validation

The API only accepts requests from the authorized frontend domain, preventing unauthorized access from external websites or malicious scripts.

### Data Integrity

All game logic runs server-side with client-side validation disabled. Questions and answers are never exposed to the frontend until needed, maintaining game integrity.

## Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Backend environment variables
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

The frontend configuration is in `frontend/.env`:

```env
# Frontend environment variables
VITE_API_URL=http://localhost:3000
```

That's it! The application will run on localhost with these settings.

**For Production Deployment**: Simply change the URLs to your actual domain names in both `.env` files.

## Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Security**: Session-based authentication, Rate limiting
- **Development**: ESLint, Modern JavaScript (ES6+)

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and formatting
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic "Who Wants to Be a Millionaire" TV show
- Built with modern web technologies for optimal performance
- Designed with security and user experience in mind

---

_Enjoy the game and see if you can become a millionaire!_ 🎯
