# Knowledge Breakdown App

An AI-powered application that helps you understand any concept by breaking it down into fundamental knowledge areas and prerequisites. Built with React and Express, powered by Google's Gemini AI.

## Features

- **Contextual Concept Analysis**: Enter any topic and get a breakdown of what you need to know to understand it
- **Multi-turn Conversations**: Uses Gemini's chat sessions to maintain context across your learning journey
- **Adaptive Learning Path**: AI becomes more specific as you dive deeper into topics
- **Interactive Navigation**: Click on any knowledge area to explore its prerequisites
- **Visual Progress**: Enhanced loading animations and progress indicators
- **Breadcrumb Navigation**: Track your learning journey and go back to previous concepts
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Accessibility Compliant**: WCAG AA color contrast standards

## Prerequisites

- Node.js (version 16 or higher)
- npm (version 8 or higher)
- Google AI Studio API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd knowledge-breakdown-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get a Gemini API key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the server (port 3000) and client (port 3001) in development mode.

## Production Deployment

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## Project Structure

```
knowledge-breakdown-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Styles and animations
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server.js              # Express backend
├── package.json           # Root package.json
├── .env.example           # Environment variables template
└── README.md
```

## API Endpoints

- `POST /api/breakdown` - Get knowledge breakdown for a concept
  - Body: `{ "concept": "string", "learningPath": ["concept1", "concept2"] }`
  - Returns contextual breakdown based on learning journey
- `POST /api/clear-history` - Clear chat session history
  - Body: `{ "learningPath": ["concept1", "concept2"] }`
- `GET /api/health` - Health check endpoint with session info

## How It Works

### Multi-turn Contextual Learning

The app uses Gemini's chat session feature to maintain context throughout your learning journey:

1. **First Breakdown**: When you enter a concept like "Machine Learning", you get broad foundational areas
2. **Contextual Drilling**: When you click on "Statistics", the AI knows you're learning it *for* machine learning
3. **Specific Breakdowns**: Each subsequent breakdown becomes more targeted to your learning path
4. **Session Memory**: The AI remembers your entire learning journey to provide relevant prerequisites

### Example Learning Journey

- **Start**: "Machine Learning" → *[Statistics, Linear Algebra, Programming, Data Analysis]*
- **Dive Deeper**: "Statistics" (in context of ML) → *[Probability Theory, Descriptive Statistics, Hypothesis Testing, Distributions]*
- **Go Further**: "Probability Theory" (in context of ML Statistics) → *[Set Theory, Combinatorics, Bayes' Theorem]*

Each step becomes more specific based on where you are in your learning path!

## Usage

1. **Enter a Concept**: Type any topic you want to understand (e.g., "Machine Learning", "Quantum Physics", "Blockchain")

2. **Get Breakdown**: Click "Break It Down" to get a list of fundamental knowledge areas

3. **Dive Deeper**: Click on any knowledge area to explore its prerequisites

4. **Navigate**: Use the breadcrumb navigation to go back to previous concepts

5. **Learn Progressively**: Build your understanding from the ground up

## Example Learning Paths

- **Machine Learning** → Statistics → Probability Theory → Set Theory
- **Blockchain** → Cryptography → Hash Functions → Mathematical Functions
- **Quantum Computing** → Linear Algebra → Complex Numbers → Number Systems

## Development

### Scripts

- `npm run dev` - Start development mode (both client and server)
- `npm run server` - Start only the server with nodemon
- `npm run client` - Start only the client
- `npm run build` - Build the client for production
- `npm start` - Start production server

### Environment Variables

- `GEMINI_API_KEY` - Your Google AI Studio API key (required)
- `PORT` - Server port (optional, defaults to 3000)
- `NODE_ENV` - Environment mode (optional, defaults to development)

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure your API key is correct
   - Check that the API key has proper permissions
   - Verify the `.env` file is in the root directory

2. **Port Already in Use**
   - Change the PORT in your `.env` file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules client/node_modules`
   - Reinstall dependencies: `npm install`

### Development Tips

- Use `npm run dev` for development with hot reloading
- Check the browser console for client-side errors
- Check the terminal for server-side errors
- The client runs on port 3001 in development, server on 3000

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
