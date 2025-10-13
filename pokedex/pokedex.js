const fs = require('fs');
const http = require('http');

const server = http.createServer((request, response) => {
    console.log('URL demandée:', request.url);
    
    const acceptLanguage = request.headers['accept-language'] || 'en';
    const userLanguage = acceptLanguage.split(',')[0].split('-')[0];
    
    // Définition des langues disponibles avec leurs textes
    const languages = {
        'fr': {
            title: 'Serveur Pokedex',
            welcome: 'Bienvenue sur le serveur Pokedex !\n\nCliquez sur un Pokémon pour voir ses détails.',
            back: 'Retour à l\'accueil',
            availablePokemon: 'Pokémons disponibles :',
            pageNotFound: 'Page non trouvée',
            errorMessage: 'Page non trouvée.\n\nRetournez à la page d\'accueil pour voir les Pokémons disponibles.',
            type: 'Type:'
        },
        'en': {
            title: 'Pokedex Server',
            welcome: 'Welcome to Pokedex Server!\n\nClick on a Pokémon to see its details.',
            back: 'Back to home',
            availablePokemon: 'Available Pokémon:',
            pageNotFound: 'Page not found',
            errorMessage: 'Page not found.\n\nReturn to the home page to see available Pokémon.',
            type: 'Type:'
        }
    };
    
    // Sélection de la langue (français par défaut si la langue détectée n'est pas disponible)
    const lang = languages[userLanguage] || languages['en'];
    const isFrench = userLanguage === 'fr';
    
    console.log('Langue détectée:', userLanguage);
    
    const generateHTML = (title, content, isPokemonPage = false) => {
        const backLink = isPokemonPage ? `<p><a href="/" style="color: #007bff; text-decoration: none;">← ${lang.back}</a></p>` : '';
        
        // Génération dynamique des liens Pokémon
        let pokemonLinks = '';
        if (!isPokemonPage) {
            const pokemonFiles = fs.readdirSync('./pokemon');
            let pokemonList = '';
            
            for (const file of pokemonFiles) {
                const pokemonName = file.split('.')[0];
                const displayName = isFrench ? pokemonName : getEnglishName(pokemonName);
                pokemonList += `
                    <li style="margin: 10px 0;">
                        <a href="/pokemon/${pokemonName}" style="color: #28a745; text-decoration: none; font-weight: bold;">${displayName}</a>
                    </li>`;
            }
            
            pokemonLinks = `
                <div style="margin: 20px 0;">
                    <h3>${lang.availablePokemon}</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${pokemonList}
                    </ul>
                </div>`;
        }
        
        return `
<!DOCTYPE html>
<html lang="${userLanguage}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .content { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0;
            white-space: pre-wrap;
        }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        ${backLink}
        ${pokemonLinks}
        <div class="content">${content}</div>
    </div>
</body>
</html>`;
    };

    // Fonction pour obtenir le nom anglais des Pokémon (simplifiée)
    function getEnglishName(frenchName) {
        const nameMap = {
            'Bulbizarre': 'Bulbasaur',
            'Salameche': 'Charmander',
            'Carapuce': 'Squirtle'
        };
        return nameMap[frenchName] || frenchName;
    }

    if (request.url === '/') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(generateHTML(lang.title, lang.welcome));
    }
    else if (request.url.startsWith('/pokemon/')) {
        const pokemonFiles = fs.readdirSync('./pokemon');
        let pokemonFound = false;
        
        // Recherche du Pokémon avec une boucle for
        for (const file of pokemonFiles) {
            const pokemonName = file.split('.')[0];
            if (request.url === `/pokemon/${pokemonName}`) {
                const data = fs.readFileSync(`./pokemon/${file}`, 'utf-8').trim();
                const [name, type] = data.split(':');
                const displayName = isFrench ? name : getEnglishName(name);
                const title = isFrench ? `${displayName} - Pokedex` : `Pokedex - ${displayName}`;
                
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(generateHTML(title, `<strong>${lang.type}</strong> ${type}`, true));
                pokemonFound = true;
                break;
            }
        }
        
        if (!pokemonFound) {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end(generateHTML(lang.pageNotFound, lang.errorMessage, true));
        }
    }
    else {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end(generateHTML(lang.pageNotFound, lang.errorMessage, true));
    }
});

server.listen(3000, () => {
    console.log('Server Pokedex écoutant sur http://localhost:3000');
    console.log('Détection automatique de langue activée!');
});