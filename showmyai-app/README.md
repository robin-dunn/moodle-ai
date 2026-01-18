# Show My AI - Backend Application

A lightweight Node.js backend application that integrates with the Moodle ShowMyAI plugin to display assignment details and provide AI-powered features.

## Overview

This application receives assignment data from the Moodle ShowMyAI plugin and displays assignment information in a user-friendly interface. It's designed to run as a microservice alongside Moodle in a Docker environment.

## Features

- Display assignment details from Moodle
- **AI-powered chat widget** with streaming responses (OpenAI integration)
- Real-time conversation with GPT-3.5-turbo or GPT-4
- Session-based chat history management
- Health check endpoint for Docker monitoring
- Lightweight Express.js server
- Input validation and error handling
- Responsive UI design
- Docker-ready with Alpine Linux base
- Rate limiting to prevent API abuse

## API Endpoints

### GET /health
Health check endpoint for monitoring service status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Show My AI",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /
Home page with service information.

### GET /assignment?id={assignmentId}
Display assignment details page with embedded AI chat widget.

**Parameters:**
- `id` (required): Assignment ID from Moodle (must be numeric)

**Example:**
```
http://localhost:3000/assignment?id=123
```

## AI Chat API Endpoints

### POST /api/chat/send
Send a message and receive a streaming AI response via Server-Sent Events (SSE).

**Request Body:**
```json
{
  "message": "Your question here",
  "sessionId": "optional-session-id"
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "session", "sessionId": "uuid-here"}
data: {"token": "Hello", "done": false}
data: {"token": " world", "done": false}
data: {"token": "", "done": true, "finishReason": "stop"}
```

### POST /api/chat/session
Create a new chat session.

**Response:**
```json
{
  "sessionId": "uuid-here",
  "createdAt": 1234567890
}
```

### GET /api/chat/session/:sessionId
Retrieve chat history for a session.

**Response:**
```json
{
  "sessionId": "uuid-here",
  "conversationHistory": [
    {"role": "user", "content": "Hello", "timestamp": 1234567890},
    {"role": "assistant", "content": "Hi there!", "timestamp": 1234567890}
  ],
  "createdAt": 1234567890,
  "lastActivity": 1234567890,
  "messageCount": 2
}
```

### DELETE /api/chat/session/:sessionId
Clear a chat session.

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### GET /api/chat/stats
Get chat service statistics.

**Response:**
```json
{
  "activeSessions": 5,
  "openaiInitialized": true
}
```

## Local Development

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. **IMPORTANT:** Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production

```bash
npm start
```

## Docker Deployment

### Build Image

```bash
docker build -t showmyai-app .
```

### Run Container

```bash
docker run -p 3000:3000 showmyai-app
```

### Docker Compose

The application is configured to run with docker-compose alongside Moodle:

```bash
docker-compose up showmyai-app
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | Logging level |
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | OpenAI model to use |
| `OPENAI_TEMPERATURE` | `0.7` | Response creativity (0-1) |
| `OPENAI_MAX_TOKENS` | `1000` | Max tokens per response |
| `CHAT_SESSION_TIMEOUT` | `86400000` | Session timeout in ms (24 hours) |
| `CHAT_RATE_LIMIT_WINDOW` | `3600000` | Rate limit window in ms (1 hour) |
| `CHAT_RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

### Setting the OpenAI API Key

**For Docker:**
```bash
# In the project root directory, create a .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Then run docker-compose
docker-compose up
```

**For Local Development:**
```bash
# In showmyai-app directory
cp .env.example .env
# Edit .env and add your API key
npm run dev
```

## Project Structure

```
showmyai-app/
├── src/
│   ├── index.js                 # Express server entry point
│   ├── routes/
│   │   └── assignments.js       # Assignment routes
│   ├── controllers/
│   │   └── assignmentController.js  # Business logic
│   └── views/
│       └── assignment.html      # Assignment detail page
├── package.json                 # Dependencies
├── Dockerfile                   # Container configuration
├── .env.example                 # Environment template
└── README.md                    # Documentation
```

## Integration with Moodle

This application is designed to work with the Moodle ShowMyAI plugin (`local_showmyai`). When a user clicks the "Open ShowMyAI Custom Tool" button on an assignment page in Moodle, they are redirected to this application with the assignment ID.

### Data Flow

1. User clicks button in Moodle assignment page
2. Moodle plugin extracts assignment ID
3. Browser redirects to `http://localhost:3000/assignment?id={assignmentId}`
4. Node.js app validates and displays assignment details

## Security

- **API Key Protection**: OpenAI API key stored server-side only, never exposed to frontend
- **Rate Limiting**: 100 requests per hour per session to prevent abuse and control costs
- **Input Validation**: Message length limited to 500 characters, session ID validation
- **Token Limits**: Maximum 1000 tokens per response to prevent runaway costs
- **Session Management**: Auto-cleanup of inactive sessions after 24 hours
- **Helmet.js**: Security headers for all HTTP responses
- **CORS**: Enabled for cross-origin requests with appropriate restrictions
- **Docker Security**: Non-root user in container
- **Health Checks**: Container monitoring and auto-restart

## Future Enhancements

- User authentication and session management
- Direct integration with Moodle API
- Database persistence for caching
- AI-powered assignment analysis
- Student submission insights
- Grading assistance features
- Learning analytics dashboard

## License

ISC

## Support

For issues or questions, please refer to the main project documentation.
