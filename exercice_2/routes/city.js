const express = require('express');
const cityRouter = express.Router();

const WEATHER_API_KEY = '72361dc0de984631970174354230208';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';

// Route pour afficher les informations de la ville
cityRouter.get('/', async function(req, res, next) {
  const city = req.query.city;
  
  if (!city) {
    return res.redirect('/');
  }
  
  try {
    // Appel à l'API météo
    const response = await fetch(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${city}&aqi=no`);
    
    if (!response.ok) {
      throw new Error('Ville non trouvée');
    }
    
    const weatherData = await response.json();
    
    // Rendu de la page villes avec les données
    res.render('villes', {
      title: `Météo - ${weatherData.location.name}`,
      city: weatherData.location.name,
      weatherData: weatherData
    });
    
  } catch (error) {
    // En cas d'erreur, afficher la page villes avec message d'erreur
    res.render('villes', {
      title: 'Ville non trouvée',
      city: city,
      error: 'Ville non trouvée ou erreur de l\'API'
    });
  }
});

module.exports = cityRouter;