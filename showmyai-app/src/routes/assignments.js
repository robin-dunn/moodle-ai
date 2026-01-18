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
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          max-width: 500px;
        }
        h1 {
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
      <div class="container">
        <div class="logo">🤖</div>
        <h1>Welcome to Show My AI</h1>
        <p>This is the backend application for the Moodle ShowMyAI plugin.</p>
        <p>To view an assignment, use: <code>/assignment?id=YOUR_ASSIGNMENT_ID</code></p>
      </div>
    </body>
    </html>
  `);
});

router.get('/assignment', assignmentController.getAssignment);

module.exports = router;
