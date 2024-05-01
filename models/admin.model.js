const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isEmail");

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    validate: [isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"],
  },
  modelName: {
    type: String,
    default: "admin", // Provide a default value here
  },
  token: [{ type: String }],
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
});

module.exports = mongoose.model("admin", adminSchema);
