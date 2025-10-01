const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Farm = require('../../model/model');
const farmsData = require('../data/development-data/farms');

async function seedDatabase() {
    try {
        // 连接数据库
        await mongoose.connect(process.env.DATABASE_URL);

        // 清空现有数据
        await Farm.deleteMany({});

        // 插入新数据
        const result = await Farm.insertMany(farmsData);

        // 显示第一个农场
        const firstFarm = await Farm.findOne();

    } catch (error) {
        // Error
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();