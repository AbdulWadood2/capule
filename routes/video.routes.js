const {
  addVideo,
  getVideos,
  getSpecificVideos,
  getSingleVideo,
  editVideo,
  deleteVideo,
} = require("../controllers/video.controller");
const { verifyToken, verifyTokenAndAdmin, verifyAll } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       Add a Video
// Access             Private - Only admin can add it
router.post("/add", verifyTokenAndAdmin, addVideo);
// @description       Get all Videos
// Access             Private only admin is able to see all videos on this plateform
router.get("/allvideos", verifyTokenAndAdmin, getVideos);
// @description       Get all Videos of a Specific Subject or chapter or topic
// Access             Public user and admin both do this
router.get("/getSpecificVideos", verifyAll, getSpecificVideos);
// @description       Get Single Video by _id
// Access             Public user and admin both do this
router.get("/singleVideo", verifyAll, getSingleVideo);
// @description       Edit Video
// Access             Private -  only admin can do it
router.put("/editVideo", verifyTokenAndAdmin, editVideo);
// @description       Delete Video
// Access             Private -  only admin can do it
router.delete("/deleteVideo", verifyTokenAndAdmin, deleteVideo);

module.exports = router;
