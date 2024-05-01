const {
  addTopic,
  getChapterTopics,
  editTopic,
  deleteTopic,
} = require("../controllers/topic.controller");
const { verifyToken, verifyTokenAndAdmin, verifyAll } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       Add a Topic
// Access             Private - Only admin can add it
router.post("/add", verifyTokenAndAdmin, addTopic);
// @description       Get all Topics of a Specific Chapter
// Access             Public user and admin both do this
router.get("/ChapterTopics", verifyAll, getChapterTopics);
// @description       Edit Topic
// Access             Private -  only admin can do it
router.put("/edit/:topicId", verifyTokenAndAdmin, editTopic);
// @description       Delete Topic
// Access             Private -  only admin can do it
router.delete("/delete/:topicId", verifyTokenAndAdmin, deleteTopic);

module.exports = router;
