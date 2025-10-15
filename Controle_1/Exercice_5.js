const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    const referId = req.query.refer;
    
    if (referId) {
        const now = new Date();
        const dateTime = now.toISOString().replace('T', ' ').substring(0, 19);
        
        const logEntry = `${referId} : ${dateTime}\n`;
        
        const logFilePath = path.join(__dirname, 'partenaire.log');
        
        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Erreur lors de l\'écriture dans le fichier partenaire.log:', err);
            } else {
                console.log(`Visite enregistrée pour le partenaire: ${referId}`);
            }
        });
    }
    
    res.render('home');
});

module.exports = router;