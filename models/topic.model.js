const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chapter",
    required: true,
  },
  modelName: {
    type: String,
    default: "topics", // Provide a default value here
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("topic", TopicSchema);
