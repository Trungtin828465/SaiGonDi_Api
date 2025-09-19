const mongoose = require('mongoose');
const db = require('../config/db.js');
const Category = require('../models/Category.model.js');

const blogCategories = [
  { name: 'Lịch trình', type: 'blog' },
  { name: 'Kinh nghiệm', type: 'blog' },
  { name: 'Sự kiện', type: 'blog' },
  { name: 'Ảnh đẹp', type: 'blog' },
  { name: 'Ẩm thực đặc sắc', type: 'blog' },
  { name: 'Review chi tiết', type: 'blog' },
  { name: 'Top-list gợi ý', type: 'blog' }
];

const getCategoryIds = async (categoryNames) => {
  const categories = await Category.default.find({ name: { $in: categoryNames }, type: 'blog' }, '_id');
  return categories.map(cat => cat._id);
};

const seedBlogCategories = async () => {
  try {
    await db.connectDB();
    console.log('Database connected for seeding blog categories.');

    // Optional: Remove existing blog categories to avoid duplicates. Uncomment the line below if you want to clear old data.
    // await Category.default.deleteMany({ type: 'blog' });
    // console.log('Existing blog categories deleted.');

    console.log('Inserting new blog categories...');
    const result = await Category.default.insertMany(blogCategories);
    console.log(`${result.length} blog categories have been successfully seeded.`);
    result.forEach(cat => console.log(`Category: ${cat.name}, ID: ${cat._id}`));
    return result;
  } catch (error) {
    console.error('Error seeding blog categories:', error);
    throw new Error(`Error seeding blog categories: ${error.message}`);
  } finally {
    console.log('Disconnecting database.');
    mongoose.disconnect();
  }
};

seedBlogCategories();
