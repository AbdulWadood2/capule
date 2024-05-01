const {
  addMockTest,
  getAllMockTests,
  editMockTests,
  deleteMockTest,
  mockTestMcqs,
} = require("../controllers/mockTest.controller");

const { verifyToken, verifyTokenAndAdmin, verifyAll } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       add mock Test
// Access             PRIVATE only admin can do it
router.post("/", verifyTokenAndAdmin, addMockTest);
// @description       get all mock tests
// Access             PUBLIC only user can do it with token
router.get("/", verifyAll, getAllMockTests);
// @description       edit mock tests
// Access             PRIVATE only admin can do it
router.put("/", verifyTokenAndAdmin, editMockTests);
// @description       delete mock tests
// Access             PRIVATE only admin can do it
router.delete("/", verifyTokenAndAdmin, deleteMockTest);
// @description       get mock tests
// Access             PUBLIC only user and admin can do it
router.get("/getAllMockMcqs", verifyAll, mockTestMcqs);

module.exports = router;
