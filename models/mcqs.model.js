const mongoose = require("mongoose");
const strictChoice = function (parentField) {
  return {
    photo: {
      type: String,
      validate: {
        validator: function (value) {
          return !this.text || !value; // Ensure only one of text or photo is present
        },
        message: "Both text and photo cannot be present at the same time.",
      },
    },
    text: {
      type: String,
      validate: {
        validator: function (value) {
          return !this.photo || !value; // Ensure only one of text or photo is present
        },
        message: "Both text and photo cannot be present at the same time.",
      },
    },
  };
};
const McqsSchema = new mongoose.Schema({
  question: {
    photo: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
  },
  options: {
    a: strictChoice(),
    b: strictChoice(),
    c: strictChoice(),
    d: strictChoice(),
    e: {
      text: { type: String },
      photo: { type: String },
    },
  },
  solution: {
    photo: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
  },
  answerOptions: {
    a: {
      text: { type: String, default: "A" },
      isCorrect: { type: Boolean, default: false },
    },
    b: {
      text: { type: String, default: "B" },
      isCorrect: { type: Boolean, default: false },
    },
    c: {
      text: { type: String, default: "C" },
      isCorrect: { type: Boolean, default: false },
    },
    d: {
      text: { type: String, default: "D" },
      isCorrect: { type: Boolean, default: false },
    },
    e: {
      text: { type: String },
      isCorrect: { type: Boolean },
    },
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subject",
    default: null,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chapter",
    default: null,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "topic",
    default: null,
  },
  modelName: {
    type: String,
    default: "mcqs", // Provide a default value here
  },
  mockTestId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
  section: { type: String, enum: ["a", "b"] },
});

module.exports = mongoose.model("mcqs", McqsSchema);
