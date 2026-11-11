const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '04_frontend', 'dist');
const destDir = path.join(__dirname, '..', 'dist');

console.log('1. Copying frontend build from', srcDir, 'to', destDir);
fs.cpSync(srcDir, destDir, { recursive: true });

const serverContent = `const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
`;

fs.writeFileSync(path.join(destDir, 'server.js'), serverContent, 'utf8');
fs.writeFileSync(path.join(destDir, 'index.js'), serverContent, 'utf8');
fs.writeFileSync(path.join(destDir, 'app.js'), serverContent, 'utf8');

console.log('2. Created entrypoints (server.js, index.js, app.js) in dist successfully!');

