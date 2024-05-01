const mongoose = require("mongoose");
const ContactSchema = new mongoose.Schema({
  countdown: {
    neet: {
      type: Date,
    },
    jee: {
      type: Date,
    },
  },
  exploreUs: {
    link: String,
  },
  adminMessage: {
    heading: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  socialMedias: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  modelName: {
    type: String,
    default: "contacts", // Provide a default value here
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("contact", ContactSchema);
