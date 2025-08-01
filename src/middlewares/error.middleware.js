// src/middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
};
