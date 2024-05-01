const {
  addMcqs,
  getMcqs,
  editMcqs,
  deleteMcqs,
  getSingleMcq,
} = require("../controllers/mcqs.controller");

const { verifyToken, verifyTokenAndAdmin, verifyAll } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       POST Mcqs
// Access             Private - Only admin can add it
router.post("/add", verifyTokenAndAdmin, addMcqs);
// @description       GET Mcqs
// Access             Public only user, admin can do this
router.get("/allMcqs", verifyAll, getMcqs);
// @description       GET Single Mcqs
// Access             Public only user, admin can do this
router.get("/", verifyAll, getSingleMcq);
// @description       PUT Edit MCQs
// Access             Private -  only admin can do it
router.put("/edit/:mcqsId", verifyTokenAndAdmin, editMcqs);
// @description       DELETE MCQs
// Access             Private -  only admin can do it
router.delete("/delete/:mcqsId", verifyTokenAndAdmin, deleteMcqs);

module.exports = router;
