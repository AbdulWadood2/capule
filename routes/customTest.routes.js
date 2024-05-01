const {
  addCustomTest,
  customTests,
  getAllCustomMcqs,
  editCustomTest,
  deleteCustomTest,
} = require("../controllers/customTest.controller");

const { verifyToken, verifyTokenAndAdmin } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       add Custom Test
// Access             PUBLIC only [user] can do this
router.post("/add", verifyToken, addCustomTest);

// @description       get all custom tests
// Access             PUBLIC only [user] can do this
router.get("/allCustomTests", verifyToken, customTests);

// @description       get all custom mcqs
// Access             PUBLIC only [user] can do this
router.get("/getAllCustomMcqs", verifyToken, getAllCustomMcqs);

// @description       edit custom test
// Access             PUBLIC only [user] can do this
router.put("/editCustomTest", verifyToken, editCustomTest);

// @description       delete custom test
// Access             PUBLIC only [user] can do this
router.delete("/deleteCustomTest", verifyToken, deleteCustomTest);

module.exports = router;
