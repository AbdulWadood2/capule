const mongoose = require("mongoose");
const McqsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  mcqId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  bookMarkMcqId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("read", McqsSchema);
