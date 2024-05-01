const mongoose = require("mongoose");

const socialMediaSchema = new mongoose.Schema({
  appName: String,
  photoLocation: {
    type: String,
    default: null,
  },
  link: String,
  contact: {
    type: mongoose.Schema.Types.ObjectId,
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("socialMedia", socialMediaSchema);
