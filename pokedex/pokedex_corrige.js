const http = require('http');
const url = require('url');
const fs = require('fs');

const POKEMONS = [
    {'name': 'Bulbizarre', 'descriptionFile': 'bulbizarre.txt', 'slug': 'bulbizarre'},
    {'name': 'Carapuce', 'descriptionFile': 'carapuce.txt', 'slug': 'carapuce'},
    {'name': 'Salamèche', 'descriptionFile': 'salameche.txt', 'slug': 'salameche'},
];

const LANGUAGES = ['fr', 'en'];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    if(path === "/"){
        let content = '<h1>Pokedex</h1><ul>';

        content += POKEMONS.map(x => (
            `<li><a href="/${x.slug}">${x.name}</a></li>`            
        ));

        content += '</ul>';

        return res.end(content);
    } else {
        const slug = path.replace('/', '');
        const lang = query.lang || 'fr';
        const pokemon = POKEMONS.find(x => x.slug === slug);

        if(!LANGUAGES.includes(lang)){
            return res.end("Erreur 404");
        }
        if(pokemon){
            return fs.readFile(`./descriptions/${lang}/${pokemon.descriptionFile}`, 'utf-8', (error, data) => {
                if(error){
                    console.error("achtung");
                } else {
                    return res.end(data);
                }
            })
        } else {
            return res.end("Erreur 404")
        }
    }
});

server.listen('3000', '127.0.0.1', () => console.log("Serveur lancé"));