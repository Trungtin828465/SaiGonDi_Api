const mongoose = require('mongoose');
const db = require('../config/db.js');
const Category = require('../models/Category.model.js');

const blogCategories = [
  { name: 'Lịc  h trình', description: 'Các bài viết liên quan đến các lịch trình tại Sài Gòn.', type: 'blog' },
  { name: 'Kinh nghiệm', description: 'Chia sẻ mẹo hữu ích, kinh nghiệm đi lại, ăn uống và vui chơi tại Sài Gòn.',type: 'blog' },
  { name: 'Sự kiện', description: 'Khám phá những sự kiện tại Sài Gòn',type: 'blog' },
  { name: 'Ảnh đẹp', description: 'Ảnh đẹp, vui chơi tại Sài Gòn',type: 'blog' },
  { name: 'Ẩm thực đặc sắc', description: 'Khám phá món ngon và đặc sản Sài Gòn.',type: 'blog' },
  { name: 'Review chi tiết', description: 'Đánh giá địa điểm, quán ăn và dịch vụ.',type: 'blog' },
  { name: 'Top-list gợi ý', description: 'Danh sách gợi ý trải nghiệm thú vị ở Sài Gòn.',type: 'blog' },
  { name: 'Ẩm thực', description: 'Tìm hiểu về món ngon của Sài Gòn.',type: 'place' },
  { name: 'Vui chơi giải trí', description: 'Khám phá các điểm vui chơi và giải trí tại Sài Gòn.',type: 'place' },
  { name: 'Di tích lịch sử', description: 'Tham quan các di tích lịch sử nổi tiếng ở Sài Gòn.',type: 'place' },
  { name: 'Mua sắm', description: 'Khám phá các trung tâm mua sắm và chợ nổi tiếng.',type: 'place' },
  { name: 'Thiên nhiên và công viên', description: 'Thư giãn tại các công viên và khu vực thiên nhiên.',type: 'place' },
  { name: 'Địa điểm tôn giáo', description: 'Tham quan các địa điểm tôn giáo và tâm linh.',type: 'place' },
  { name: 'Khách sạn và lưu trú', description: 'Tìm hiểu về các khách sạn và nơi lưu trú tốt nhất.',type: 'place' },
  { name: 'Ẩm thực đường phố', description: 'Khám phá các món ăn đường phố đặc sắc.',type: 'place' },
  { name: 'Quán cà phê và trà', description: 'Tìm hiểu về các quán cà phê và trà nổi tiếng.',type: 'place' }

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