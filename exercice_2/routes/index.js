const express = require('express');
const router = express.Router();

const WEATHER_API_KEY = '72361dc0de984631970174354230208';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';

// Route pour la page d'accueil
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Mon Application', 
    subtitle: 'my super site' 
  });
});

// Route pour gérer la recherche et rediriger vers villes
router.post('/search', function(req, res, next) {
  const city = req.body.city;
  
  if (city) {
    // Redirection vers la page villes avec la ville en paramètre
    res.redirect(`/villes?city=${encodeURIComponent(city)}`);
  } else {
    // Si pas de ville, rediriger vers l'accueil
    res.redirect('/');
  }
});

// Route pour la météo
router.get('/weather/:city', async function(req, res, next) {
  try {
    const city = req.params.city;
    const response = await fetch(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${city}&aqi=no`);
    
    if (!response.ok) {
      throw new Error('Erreur API météo');
    }
    
    const weatherData = await response.json();
    res.json(weatherData);
    
  } catch (error) {
    next(error);
  }
});

// Route pour la météo avec query parameter
router.get('/weather', async function(req, res, next) {
  try {
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ error: 'Paramètre "city" requis' });
    }
    
    const response = await fetch(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${city}&aqi=no`);
    
    if (!response.ok) {
      throw new Error('Erreur API météo');
    }
    
    const weatherData = await response.json();
    res.json(weatherData);
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;