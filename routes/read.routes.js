const {
  readMcqsInTopic,
  readBook,
  readBookMarkMcq,
  readVideo,
} = require("../controllers/read.controller");

const { verifyToken, verifyTokenAndAdmin } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       read mcq
// Access             public only user can do this
router.post("/readMcqsInTopic", verifyToken, readMcqsInTopic);
// @description       read book
// Access             public only user can do this
router.post("/readBook", verifyToken, readBook);
// @description       read book mark mcq
// Access             public only user can do this
router.post("/readBookMarkMcq", verifyToken, readBookMarkMcq);
// @description       read video
// Access             public only user can do this
router.post("/readVideo", verifyToken, readVideo);

module.exports = router;
