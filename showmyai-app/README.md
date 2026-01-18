# Show My AI - Backend Application

A lightweight Node.js backend application that integrates with the Moodle ShowMyAI plugin to display assignment details and provide AI-powered features.

## Overview

This application receives assignment data from the Moodle ShowMyAI plugin and displays assignment information in a user-friendly interface. It's designed to run as a microservice alongside Moodle in a Docker environment.

## Features

- Display assignment details from Moodle
- Health check endpoint for Docker monitoring
- Lightweight Express.js server
- Input validation and error handling
- Responsive UI design
- Docker-ready with Alpine Linux base

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
Display assignment details page.

**Parameters:**
- `id` (required): Assignment ID from Moodle (must be numeric)

**Example:**
```
http://localhost:3000/assignment?id=123
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

3. Start development server:
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

- Input validation for all parameters
- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Non-root user in Docker container
- Health checks for container monitoring

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
