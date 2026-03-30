const Cafeteria = require('../models/Cafeteria');

const seedCafes = async () => {
  const count = await Cafeteria.countDocuments();
  if (count > 0) return;

  await Cafeteria.insertMany([
    { name: 'Basement Cafe' },
    { name: 'Food Truck' },
    { name: 'Quetta Cafe' }
  ]);

  console.log('✅ Cafes seeded');
};

module.exports = seedCafes;
