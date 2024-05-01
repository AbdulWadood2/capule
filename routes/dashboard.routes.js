const { getItemsInNumber } = require("../controllers/dashboard.controller");

const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyAll,
} = require("../utils/verifyToken");

const router = require("express").Router();

// @description       get Items In Number
// Access             PRIVATE only admin can do it
router.get("/getItemsInNumber", verifyTokenAndAdmin, getItemsInNumber);

module.exports = router;
