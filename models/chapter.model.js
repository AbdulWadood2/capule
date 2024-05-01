const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subject",
    required: true,
  },
  img: {
    type: String,
  },
  modelName: {
    type: String,
    default: "chapters", // Provide a default value here
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("chapter", ChapterSchema);
