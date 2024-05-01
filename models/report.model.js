const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema({
  userId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  mcqId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  reason: {
    type: String,
  },
  resolved: { type: Boolean, default: false },
  reportType: { type: String, enum: ["question", "book", "video"] },
  dateCreated: { type: Date, default: Date.now() },
  modelName: {
    type: String,
    default: "report",
  },
});

module.exports = mongoose.model("report", reportSchema);
