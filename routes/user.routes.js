const router = require("express").Router();
const {
  register,
  editProfile,
  login,
  logout,
  getAllUsers,
  getUser,
} = require("../controllers/user.controller");
/* verifyToken */
const {
  verifyToken,
  verifyTokenAndAdmin,
  refreshToken,
} = require("../utils/verifyToken");
// @description       register user
// Access             public only user can do this
router.post("/register", register);
// @description       login user
// Access             public only user can do this
router.post("/login", login);
// @description       logout user
// Access             public only user can do this
router.post("/logout", verifyToken, logout);
// @description       Edit Profile
// @Access            Private (Authenticated) - User having token can edit otherwise cannot edit
router.put("/editprofile", verifyToken, editProfile);

// @description       get all users
// @Access            Private only admin can do this
router.get("/allusers", verifyTokenAndAdmin, getAllUsers);

// post refresh token
// for  public
router.post("/refreshToken", refreshToken);
// @description       get user data
// @Access            Public only user can do this
router.get("/getUser", getUser);

module.exports = router;
