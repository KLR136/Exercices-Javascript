const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res) => {
    console.log(request.url);
    res.end('Hello World');});
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

const description = fs.readFileSync('../fichier.txt', 'utf-8', (error, text) => {
    if (error) {
        return console.error('Error reading file:', error);
    }
    else {
        console.log(text);
    }
});