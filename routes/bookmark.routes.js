const router = require("express").Router();
/* verifyToken */
const {
  verifyToken,
  verifyTokenAndAdmin,
  refreshToken,
} = require("../utils/verifyToken");
/* import controller */
const {
  createBookMarkMCQS,
  getAllbookMarksMCQS,
} = require("../controllers/bookmark.controllers");

/* routes */

/* mcqs section */
// @description       Create Book makes
// Access             PUBLIC only [user] can do this
router.post("/addMcqBookMark", verifyToken, createBookMarkMCQS);
// @description       get all bookMarks MCQS
// Access             PUBLIC only [user] can do this
router.get("/getMcqBookMarks", verifyToken, getAllbookMarksMCQS);

module.exports = router;
