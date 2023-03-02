const express = require('express');
const router = express.Router();
const forget = require('../Modules/forgetModule')

router.post("/forgetpassword", forget.forgetpassword);
router.post("/matchcode",forget.getcode);
router.post("/resetpassword",forget.resetpassword)

module.exports = router;