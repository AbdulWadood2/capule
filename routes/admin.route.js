const router = require("express").Router();
const {
  editProfile,
  login,
  logout,
  getAdmin,
} = require("../controllers/admin.controller");
/* verifyToken */
const {
  verifyToken,
  verifyTokenAndAdmin,
  refreshToken,
} = require("../utils/verifyToken");
// @description       login admin
// Access             PRIVATE only admin can do it
router.post("/login", login);
// @description       logout admin
// Access             PRIVATE only admin can do it
router.post("/logout", verifyTokenAndAdmin, logout);
// @description       Edit Profile
// @Access            PRIVATE only admin can do it
router.put("/editprofile", verifyTokenAndAdmin, editProfile);
// post refresh token
// for  public
router.post("/refreshToken", refreshToken);
// @description       get admin data
// Access             PRIVATE only admin can do it
router.get("/getAdmin", getAdmin);

module.exports = router;
