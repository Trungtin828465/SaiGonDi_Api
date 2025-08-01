const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middlewares/error.middleware'); // ✅ đường dẫn đúng tên

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.use('/api/auth', authRoutes);
// app.use('/api/blogs', blogRoutes);
// app.use('/api/users', userRoutes);

// ✅ Middleware xử lý lỗi
app.use(errorHandler);

module.exports = app;
