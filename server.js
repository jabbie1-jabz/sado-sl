const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/customer.html' : req.url;
  filePath = path.join(__dirname, filePath);

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  if (extname === '.js') contentType = 'text/javascript';
  if (extname === '.css') contentType = 'text/css';
  if (extname === '.jpg' || extname === '.jpeg') contentType = 'image/jpeg';
  if (extname === '.png') contentType = 'image/png';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>', 'utf-8');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}/`);
  console.log(`📄 Customer page: http://${HOST}:${PORT}/customer.html`);
  console.log(`🔐 Admin page: http://${HOST}:${PORT}/admin.html`);
});
