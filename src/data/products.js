export const PRODUCTS = [
  {
    id: 2,
    image: '/img/haiers.webp',
    title: 'Haier BSD-09HN1',
    description: 'Инверторная сплит-система с Wi-Fi модулем и энергопотреблением класса А++.',
    power: '2.6 кВт',
    cooling: '2.6 кВт',
    price: 99990,
  },
  {
    id: 3,
    image: '/img/samsungc.webp',
    title: 'Samsung P09EP2',
    description: 'Настенная сплит-система с инверторным компрессором и самодиагностикой.',
    power: '2.8 кВт',
    cooling: '2.8 кВт',
    price: 109990,
  },
  {
    id: 4,
    image: '/img/toshibab.webp',
    title: 'Toshiba Seiya RAS-B07',
    description: 'Инверторный кондиционер с низким уровнем шума и 4D распределением воздуха.',
    power: '2.7 кВт',
    cooling: '2.7 кВт',
    price: 96990,
  },
];

export const productsById = PRODUCTS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
