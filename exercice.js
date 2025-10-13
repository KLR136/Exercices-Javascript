const listeEx1 = [1, 2, 3, 4, 5];
const listeCarres = listeEx1.map(x => x * x);
console.log(listeCarres);

const listeEx2 = [1, -4, 12, 0, -3, 29, -150];
const listeEx2Filtree = listeEx2.filter(x => x >= 0);
console.log(listeEx2Filtree);

const listeEx3 = [1, -4, 12, 0, -3, 29, -150];
const sommeNegsEx3 = listeEx3.reduce((acc, x) => x < 0 ? acc + x : acc, 0);
console.log(sommeNegsEx3);

const listeEx4 = [12, 46, 32, 64]
const croissantEx4 = listeEx4.sort((a, b) => a - b);
console.log(croissantEx4);

const listeEx5 = [
    {'name': 'Jean', 'birthDate': 1985},
    {'name': 'Édouard', 'birthDate': 1994},
    {'name': 'Eugénie', 'birthDate': 1969},
    {'name': 'Patrick', 'birthDate': 2015},
]
const listeEx5Triee = listeEx5.map(personne => personne.name).sort((a, b) => a.birthDate - b.birthDate);
console.log(listeEx5Triee);

const ex6 = "George Raymond Richard Martin"
const initialesEx6 = ex6.split(' ').map(nom => nom[0].toUpperCase()).join('.');
console.log(initialesEx6);