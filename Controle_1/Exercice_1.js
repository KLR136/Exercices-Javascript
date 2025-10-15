const products = [
    {name: "Clavier mecanique", price: 120, category: "informatique", rating: 4.6},
    {name: "Souris gamer", price: 60, category: "informatique", rating: 4.3},
    {name: "Casque audio", price: 90, category: "audio", rating: 4.8},
    {name: "Ecran 4K", price: 400, category: "informatique", rating: 4.7},
    {name: "Enceinte Bluetooth", price: 150, category: "audio", rating: 4.1},
    {name: "Webcam HD", price: 70, category: "informatique", rating: 3.9},
]

const priceWithTax = products.map(product => {
    if (product.rating > 4.5) {
    const price = parseFloat(product.price);
    return {
        ...product,
        price: (price * 1.2).toFixed(2)
    };
    }
});
console.log(priceWithTax);