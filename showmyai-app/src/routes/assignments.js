const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Show My AI</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          height: 100vh;
          background: #f5f7fa;
        }
        .app-header {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.25rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .content {
          display: flex;
          justify-content: center;
          align-items: center;
          height: calc(100vh - 68px);
        }
        .container {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          max-width: 500px;
        }
        h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        p {
          color: #666;
          line-height: 1.6;
        }
        .logo {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <header class="app-header">
        <h1>Show My AI Demo App</h1>
      </header>
      <div class="content">
        <div class="container">
          <div class="logo">🤖</div>
          <h2>Welcome to Show My AI</h2>
          <p>This is the backend application for the Moodle ShowMyAI plugin.</p>
          <p>To view an assignment, use: <code>/assignment?id=YOUR_ASSIGNMENT_ID</code></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

router.get('/assignment', assignmentController.getAssignment);

module.exports = router;
