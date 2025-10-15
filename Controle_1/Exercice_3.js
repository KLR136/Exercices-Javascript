async function capitalPerCountry(countryName) {
    if (typeof countryName !== 'string' || countryName.trim() === '') {
        throw new Error('Le nom du pays doit être une chaîne de caractères non vide');
    }
    
    const country = countryName.trim();
    
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
        
        if (!response.ok) {
            throw new Error(`Pays non trouvé: ${country}`);
        }
        
        const data = await response.json();
        const countryData = data[0];
        const capital = countryData.capital ? countryData.capital[0] : 'Aucune capitale';

        return { country: countryName, capital: capital };

    } catch (error) {
        console.error(`Erreur pour ${country}:`, error.message);
        throw new Error(`Impossible de récupérer la capitale pour ${country}`);
    }
}

console.log(await capitalPerCountry("France"));