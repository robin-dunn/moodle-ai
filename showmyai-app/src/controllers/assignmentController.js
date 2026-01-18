const path = require('path');
const fs = require('fs');

const getAssignment = (req, res) => {
  const assignmentId = req.query.id;

  if (!assignmentId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Missing Assignment ID</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .error-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #dc3545; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Missing Assignment ID</h1>
          <p>Please provide an assignment ID in the URL.</p>
          <p>Example: /assignment?id=123</p>
        </div>
      </body>
      </html>
    `);
  }

  if (!/^\d+$/.test(assignmentId)) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Invalid Assignment ID</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .error-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #dc3545; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Invalid Assignment ID</h1>
          <p>Assignment ID must be a number.</p>
          <p>Provided: ${assignmentId}</p>
        </div>
      </body>
      </html>
    `);
  }

  const htmlPath = path.join(__dirname, '..', 'views', 'assignment.html');

  fs.readFile(htmlPath, 'utf8', (err, html) => {
    if (err) {
      console.error('Error reading template:', err);
      return res.status(500).send('Internal server error');
    }

    const renderedHtml = html
      .replace(/{{assignmentId}}/g, assignmentId)
      .replace(/{{timestamp}}/g, new Date().toLocaleString());

    res.send(renderedHtml);
  });
};

module.exports = {
  getAssignment
};
