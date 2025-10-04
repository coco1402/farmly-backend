const path = require('path');
const mongoose = require('mongoose');
const Farm = require('../../model/farmModel');

async function seedDatabase(environment = 'development') {
    try {
        // Load appropriate .env file based on environment
        const envFile = environment === 'test' ? '.env.test' : '.env';
        require('dotenv').config({ path: path.join(__dirname, '../../', envFile) });

        // Load data based on environment
        const { farmData } = require(`../data/${environment}-data`);

        console.log(`📂 Loading ${environment} data...`);

        // Connect to database
        await mongoose.connect(process.env.DATABASE_URL);
        console.log(`🔗 Connected to database: ${process.env.DATABASE_URL?.split('@')[1] || 'local'}`);

        // Clear existing data
        await Farm.deleteMany({});
        console.log('🗑️  Cleared existing farms');

        // Insert new data
        const result = await Farm.insertMany(farmData);
        console.log(`✨ Inserted ${result.length} farms`);

        // Display first farm as verification
        const firstFarm = await Farm.findOne();
        if (firstFarm) {
            console.log(`📍 Sample farm: ${firstFarm.name}`);
        }

        return result;

    } catch (error) {
        console.error('Error seeding database:', error.message);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// If run directly (not imported), seed development database
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = seedDatabase;