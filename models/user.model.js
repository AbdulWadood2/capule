const mongoose = require("mongoose");
const validator = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  slug: {
    type: String,
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
  state: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"],
  },
  exam: {
    type: String,
    required: true,
    enum: ["NEET", "JEE"],
  },
  class: {
    type: String,
    required: false,
    enum: ["11", "12"],
  },
  status: {
    type: String,
    enum: ["verified", "unverified"],
    default: "unverified",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  bookmark: [
    {
      chapterId: { type: mongoose.Schema.Types.ObjectId },
      mcqId: { type: mongoose.Schema.Types.ObjectId },
      photo: {
        type: String,
        default: null,
      },
      text: {
        type: String,
        default: null,
      },
    },
  ],
  modelName: {
    type: String,
    default: "users", // Provide a default value here
  },
  token: [{ type: String }],
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
});

module.exports = mongoose.model("user", UserSchema);
