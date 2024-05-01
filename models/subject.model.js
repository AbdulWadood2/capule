const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  stdClass: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
    default: null,
  },
  modelName: {
    type: String,
    default: "subjects", // Provide a default value here
  },
  perMcqMark: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("subject", SubjectSchema);
