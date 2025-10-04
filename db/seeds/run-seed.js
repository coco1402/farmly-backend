const seed = require('./seed');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || process.env.NODE_ENV || 'development';

console.log(`<1 Seeding ${environment} database...`);

seed(environment)
  .then(() => {
    console.log(' Database seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('L Seeding failed:', error);
    process.exit(1);
  });
