// import { formatPrice } from '../data/formatPrice'; // Импорт функции для форматирования цены

// // Курс обмена
// const exchangeRate = 0.035;


// export const cardsData = [
//   { id: 1, imgSrc: '/DANDY.jpg', title: 'КАРТЫ', name: 'DANDY', price: '200 BYN.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 2, imgSrc: '/LIS_ARISA.jpg', title: 'ФОРАМЕН', name: 'LIS ARISA', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 3, imgSrc: '/DAN-KIT.jpg', title: 'DAN-KIT', name: 'DAN-KIT', price: '160 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 4, imgSrc: '/HURTY.jpg', title: 'БРАТЬЯ', name: 'HURTIGSAMA', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 5, imgSrc: '/SHENYU.jpg', title: 'НУНКИ', name: 'SHENYU', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 6, imgSrc: '/TANJASHU.jpg', title: 'БЕТЕЛЬГЕЙЗЕ', name: 'TANJASHU', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 7, imgSrc: '/CRUWIEE.jpg', title: 'КЕИД', name: 'CRUWIEE', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 8, imgSrc: '/ABYSS_KITTY.jpg', title: 'АВИОР', name: 'ABYSS KITTY', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 9, imgSrc: '/STELLARLIN.jpg', title: 'ИГНИС', name: 'STELLARLIN', price: '150 РУБ.', description: 'ОТКРЫТКА A6', category: 'prints' },
//   { id: 10, imgSrc: '/MAKOTO.jpg', title: 'БЕЛЛАТРИКС', name: 'MAKOTO', price: '150 РУБ.', description: 'ЗНАЧЕК', category: 'pins' },
//   { id: 11, imgSrc: '/БЕЛЛ.jpg', title: 'БЕЛЛАТРИКС', name: 'AKIRA', price: '150 РУБ.', description: 'ЗНАЧЕК', category: 'pins' },
//   { id: 12, imgSrc: '/BETA.jpg', title: 'АЛЬКОР', name: 'BETA', price: '200 РУБ.', description: 'ЗНАЧЕК', category: 'pins' },
//   { id: 13, imgSrc: '/NIKORIV.jpg', title: 'АСЦЕЛЛА', name: 'NIKORIV', price: '580 РУБ.', description: 'НОСКИ', category: 'other' },
//   { id: 14, imgSrc: '/Cover.jpg', title: 'МАСКОТ', name: 'LIS ARISA', price: '160 РУБ.', description: 'ЗНАЧЕК', category: 'pins' },
//   { id: 15, imgSrc: '/ALKOR.jpg', title: 'РУСАЛ', name: 'KANNA', price: '350 РУБ.', description: 'СТЕНД', category: 'acrylic' },
//   { id: 16, imgSrc: '/keid.png', title: 'ЗВЕЗДА КЕИД', name: 'CRUWIEE', price: '350 РУБ.', description: 'БРЕЛОК', category: 'acrylic' }
// ].map((item) => ({
//   ...item,
//   price: formatPrice((parseInt(item.price.replace(' РУБ.', ''), 10) * exchangeRate).toFixed(2)) // Форматируем цену с помощью функции
// }));

// useEffect(() => {
//   fetch('http://localhost:5000/products')
//     .then(response => response.json())
//     .then(data => setFilteredData(data))
//     .catch(() => setFilteredData(cardsData)); // Если сервер недоступен, используем локальные данные
// }, []);

