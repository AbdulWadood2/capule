const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
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
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "topic",
    required: true,
    unique: true,
  },
  videoFile: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    default: "videos", // Provide a default value here
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("video", VideoSchema);
