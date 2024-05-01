const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  mockTestName: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
});

module.exports = mongoose.model("mockTest", UserSchema);
