const express = require("express");
const router = express.Router();
const {
  addReport,
  allReport,
  getSpecificRecord,
  resolveReport,
  deleteReport,
} = require("../controllers/report.controller");
/* security */
const { verifyToken, verifyTokenAndAdmin } = require("../utils/verifyToken");
// @description       add report
// Access             public only user can do this
router.post("/", verifyToken, addReport);

// @description       get all reports
// Access             private only admin can do this
router.get("/", verifyTokenAndAdmin, allReport);

// @description       get single report
// Access             private user can do this
router.get("/getSpecificReport", verifyTokenAndAdmin, getSpecificRecord);

// @description       resolve single report
// Access             private user can do this
router.put("/resolveReport", verifyTokenAndAdmin, resolveReport);

// @description       delete report
// Access             private user can do this
router.delete("/deleteReport", verifyTokenAndAdmin, deleteReport);

module.exports = router;
