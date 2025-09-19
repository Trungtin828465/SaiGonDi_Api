const mongoose = require('mongoose');
const db = require('../config/db.js');
const Category = require('../models/Category.model.js');

const blogCategories = [
  { name: 'Lịch trình', description: 'Các bài viết liên quan đến các lịch trình tại Sài Gòn.', type: 'blog' },
  { name: 'Kinh nghiệm', description: 'Chia sẻ mẹo hữu ích, kinh nghiệm đi lại, ăn uống và vui chơi tại Sài Gòn.',type: 'blog' },
  { name: 'Sự kiện', description: 'Khám phá những sự kiện tại Sài Gòn',type: 'blog' },
  { name: 'Ảnh đẹp', description: 'Ảnh đẹp, vui chơi tại Sài Gòn',type: 'blog' },
  { name: 'Ẩm thực đặc sắc', description: 'Khám phá món ngon và đặc sản Sài Gòn.',type: 'blog' },
  { name: 'Review chi tiết', description: 'Đánh giá địa điểm, quán ăn và dịch vụ.',type: 'blog' },
  { name: 'Top-list gợi ý', description: 'Danh sách gợi ý trải nghiệm thú vị ở Sài Gòn.',type: 'blog' }
];

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