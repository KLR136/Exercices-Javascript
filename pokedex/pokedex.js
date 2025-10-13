const fs = require('fs');
const http = require('http');

const description = fs.readFileSync('./fichier.txt', 'utf-8', (error, text) => {
    if (error) {
        return console.error('Error reading file:', error);
    }
    else {
        console.log(text);
    }
});