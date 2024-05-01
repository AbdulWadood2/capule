/* models */
const Contact = require("../models/contact.model");
const Social = require("../models/socialMedia.model");
/* error */
const { customError } = require("../errors/custom.error");
// status codes
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

/* contact section started ⚠ */

// @description       Add Contact
// Access             Private only admin can do this
const addContacts = async (req, res) => {
  const { countdown, exploreUs, adminMessage } = req.body;
  const checkContact = await Contact.find();
  if (checkContact.length == 1) {
    return customError(StatusCodes.CONFLICT, res, "contact is already exists");
  }
  const newContact = await Contact.create({
    countdown,
    exploreUs,
    adminMessage,
  });
  try {
    res.status(201).json({ success: true, data: newContact, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Edit Contact
// Access             Private only admin can do this
const editContact = async (req, res) => {
  try {
    const contact = await Contact.find();
    if (!contact) {
      return customError(StatusCodes.NOT_FOUND, res, "contacts not exists");
    }
    const contactForUpdate = await Contact.findOne({ _id: contact[0]._id });
    // Update the subject properties from the request body
    Object.assign(contactForUpdate, req.body);

    // Save the updated subject
    await contactForUpdate.save();
    res.status(StatusCodes.OK).json({
      success: true,
      data: "contacts update successfully",
      contacts: contactForUpdate,
      error: null,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       Get Contact
// Access             Public only [user admin] can do this
const getContact = async (req, res) => {
  try {
    let contacts = await Contact.find().select("-modelName -__v -_id");
    contacts = contacts[0];
    if (!contacts) {
      return customError(StatusCodes.BAD_REQUEST, res, "contacts not found");
    }
    const socialMediaIds = contacts.socialMedias;
    if (socialMediaIds.length > 0) {
      // Fetch social media documents based on IDs
      const socialMediaDocuments = [];
      // Use a for loop to fetch social media documents based on IDs
      for (const socialMediaId of socialMediaIds) {
        const socialMediaDocument = await Social.findById(socialMediaId._id);
        if (socialMediaDocument) {
          socialMediaDocuments.push(socialMediaDocument);
        }
      }
      contacts = contacts.toObject();
      // Add the expanded social media documents to the contacts document
      contacts.socialMedias = socialMediaDocuments;
    }

    // Log or return the updated contacts document
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      error: null,
      data: contacts,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       Delete Contact
// Access             Private -  only admin can do it
const deleteContact = async (req, res) => {
  try {
    const deleteContact = await Contact.findByIdAndDelete(req.query.contactId);
    const socialMedias = [];

    for (item of deleteContact.socialMedias) {
      const socialMedia = await Social.findOne({ _id: item._id });
      socialMedias.push(socialMedia);
    }
    for (item of socialMedias) {
      const deleteMedia = await Social.findByIdAndDelete({ _id: item._id });
    }
    if (deleteContact) {
      res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
        success: true,
        data: "Contact has been Deleted Successfully",
        error: null,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "contact is not found");
    }
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

/* social media section started ⚠ */

// @description       Add socialMedia
// Access             Private only admin can do it
const addSocialMediaAccount = async (req, res) => {
  try {
    let contact = await Contact.find();
    const { appName, link } = req.body;
    if (!contact) {
      return customError(StatusCodes.CONFLICT, res, "this contact not exists");
    }
    contact = await Contact.findOne({ _id: contact[0]._id });
    const socialMedia = await Social.create({
      appName,
      link,
      contact: contact._id,
    });
    contact.socialMedias.push(socialMedia._id);
    await contact.save();
    res.status(StatusCodes.OK).json({
      success: true,
      data: "social media is added",
      error: null,
      contact,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       get all socialMedia
// Access             Public only [user and admin] can do this
const getAllSocialMedias = async (req, res) => {
  try {
    let contact = await Contact.find();
    const socialMedias = [];
    if (!(contact[0].socialMedias.length > 0)) {
      return customError(StatusCodes.NOT_FOUND, res, "social medias not added");
    }
    for (item of contact[0].socialMedias) {
      const socialMedia = await Social.findOne({ _id: item._id });
      socialMedias.push(socialMedia);
    }
    res.status(StatusCodes.OK).json({
      success: true,
      socialMedias,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       Edit socialMedia
// Access             Private admin can do this
const editSocialMedia = async (req, res) => {
  try {
    const { id } = req.query;
    let socialMedia = await Social.findOne({ _id: id });
    Object.assign(socialMedia, req.body);
    await socialMedia.save();
    res.status(StatusCodes.OK).json({
      success: true,
      data: "this social Media is edited",
      error: null,
      socialMedia,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       delete socialMedia
// Access             Private admin can do this
const deleteSocialMedia = async (req, res) => {
  try {
    const { id } = req.query;
    const socialMedia = await Social.findByIdAndDelete({ _id: id });
    let contact = await Contact.find();
    contact = await Contact.findOne({ _id: contact[0]._id });
    contact.socialMedias = contact.socialMedias.filter((item) => {
      if (item == id) {
        return false;
      } else {
        return true;
      }
    });
    await contact.save();
    res.status(StatusCodes.OK).json({
      success: true,
      data: `social media ${socialMedia.appName} is deleted`,
      error: null,
    });
    // console.log(socialMedia);
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

module.exports = {
  addContacts,
  getContact,
  deleteContact,
  editContact,
  addSocialMediaAccount,
  editSocialMedia,
  deleteSocialMedia,
  getAllSocialMedias,
};
