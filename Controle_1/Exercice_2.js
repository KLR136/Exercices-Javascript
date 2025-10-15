const fs = require('fs');
const path = require('path');

function addTextBlockToFilePathEnd(textBlock, filePath) {
    if (typeof textBlock === 'string' && typeof filePath === 'string') {
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist.');
        }
        
        const fileExtension = path.extname(filePath);
        const fileNameWithoutExtension = path.basename(filePath, fileExtension);
        const directory = path.dirname(filePath);
        
        const newFileName = fileNameWithoutExtension + textBlock + fileExtension;
        const newFilePath = path.join(directory, newFileName);
        
        fs.renameSync(filePath, newFilePath);
        
        return newFilePath;
    } else {
        throw new Error('Both arguments must be strings.');
    }
}

console.log(addTextBlockToFilePathEnd('_v1', 'Exercice_2.js'));