const router = require("express").Router();
/* authurization */
const { verifyTokenAndAdmin} = require("../utils/verifyToken");
/* import multerFile */
const upload = require("../multer");
/* controller */
const { uploadFiles } = require("../controllers/fileSystem.controller");
// @description       POST files
// @Access            Private only admin can do this
router.post("/addFiles", verifyTokenAndAdmin, upload, uploadFiles);
module.exports = router;
