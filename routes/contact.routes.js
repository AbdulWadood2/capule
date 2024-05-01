const {
  addContacts,
  getContact,
  deleteContact,
  editContact,
  addSocialMediaAccount,
  editSocialMedia,
  deleteSocialMedia,
  getAllSocialMedias,
} = require("../controllers/contact.controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyAll,
} = require("../utils/verifyToken");

const router = require("express").Router();

// @description       Add Contact
// Access             Private only admin can do this
router.post("/add", verifyTokenAndAdmin, addContacts);
// @description       Edit Contact
// Access             Private only admin can do this
router.put("/edit", verifyTokenAndAdmin, editContact);
// @description       Get Contact
// Access             Public only [user admin] can do this
router.get("/getContact", verifyAll, getContact);
// @description       Delete Contact
// Access             Private -  only admin can do it
router.delete("/deleteContact", verifyTokenAndAdmin, deleteContact);

/* social media section started ⚠ */

// @description       Add socialMedia
// Access             Private only admin can do it
router.post(
  "/addSocialMediaAccount",
  verifyTokenAndAdmin,
  addSocialMediaAccount
);
// @description       get all socialMedia
// Access             Public only [user and admin] do this
router.get("/getAllSocial", verifyAll, getAllSocialMedias);
// @description       Edit socialMedia
// Access             Private admin can do this
router.put("/editSocialMedia", verifyTokenAndAdmin, editSocialMedia);
// @description       delete socialMedia
// Access             Private admin can do this
router.delete("/deleteSocialMedia", verifyTokenAndAdmin, deleteSocialMedia);

module.exports = router;
