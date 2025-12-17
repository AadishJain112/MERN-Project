const router = require('express').Router();
const { register, login, selfRegister } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/self-register', selfRegister);

module.exports = router;

