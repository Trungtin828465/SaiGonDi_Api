const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;


// File: backend/src/middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
};
