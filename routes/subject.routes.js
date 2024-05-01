const {
  addSubject,
  getAllSubjects,
  getSubjectsOfClass11,
  getSubjectsOfClass12,
  editSubject,
  deleteSubject,
  getSubjectsChapters,
} = require("../controllers/subject.controller");
const {
  verifyTokenAndAdmin,
  verifyToken,
  verifyAll,
} = require("../utils/verifyToken");

const router = require("express").Router();

// @description       Add a Subject
// Access             Private - Only admin can add it
router.post("/add", verifyTokenAndAdmin, addSubject);
// @description       get all subjects
// Access             Private - Only admin can add it
router.get("/all", verifyTokenAndAdmin, getAllSubjects);
// @description       get all subjects of class 11
// Access             Public -  but mean valid token is required to view
router.get("/class11", verifyAll, getSubjectsOfClass11);
// @description       get all subjects of class 12
// Access             Public -  but mean valid token is required to view
router.get("/class12", verifyAll, getSubjectsOfClass12);
// @description       edit Subject
// Access             Private -  only admin can do it
router.put("/edit/:subjectId", verifyTokenAndAdmin, editSubject);
// @description       delete Subject
// Access             Private -  only admin can do it
router.delete("/delete/:subjectId", verifyTokenAndAdmin, deleteSubject);
// @description       GET subjectsChapters
// Access             PUBLIC user and admin
router.get("/getSubjectsChapters", verifyAll, getSubjectsChapters);

module.exports = router;
