const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  questionQuantity: { type: Number },
  topics: [{ type: mongoose.Schema.Types.ObjectId }],
  userId: { type: mongoose.Schema.Types.ObjectId },
  dateCreated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("custom", UserSchema);
