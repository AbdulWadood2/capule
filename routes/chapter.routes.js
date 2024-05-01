const {
  addChapter,
  getSubjectChapters,
  editChapter,
  deleteChapter,
  getChapterInfo,
  getChaptersTopics,
} = require("../controllers/chapter.controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyAll,
} = require("../utils/verifyToken");

const router = require("express").Router();

// @description       Add a Chapter
// Access             Private - Only admin can add it
router.post("/add", verifyTokenAndAdmin, addChapter);
// @description       Get all Chapters of a Specific Subject
// Access             Public only [admin,user] can do this
router.get("/:subjectId/chapters", verifyAll, getSubjectChapters);
// @description       Edit Chapter
// Access             Private -  only admin can do it
router.put("/edit/:chapterId", verifyTokenAndAdmin, editChapter);
// @description       Delete Chapter
// Access             Private -  only admin can do it
router.delete("/delete/:chapterId", verifyTokenAndAdmin, deleteChapter);
// @description       GET Chapter Info
// Access             Public only [admin user] can do this
router.get("/getChapterInfo", verifyAll, getChapterInfo);
// @description       GET Chapter Topics
// Access             Public only [admin user] can do this
router.get("/getChaptersTopics", verifyAll, getChaptersTopics);

module.exports = router;
