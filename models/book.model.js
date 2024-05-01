const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  stdClass: {
    type: String,
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subject",
    required: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chapter",
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  pdfFile: {
    type: String,
    default: null,
  },
  modelName: {
    type: String,
    default: "books", // Provide a default value here
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("book", BookSchema);
