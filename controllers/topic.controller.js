const Topic = require("../models/topic.model");
const Video = require("../models/video.model");
const Mcq = require("../models/mcqs.model");
const Read = require("../models/read.model");
/* status codes */
const { StatusCodes } = require("http-status-codes");
/* errors */
const { customError } = require("../errors/custom.error");

/* file System */
const fs = require("fs");

// @description       Add a Topic
// Access             Private - Only admin can add it
const addTopic = async (req, res) => {
  const { title, chapterId } = req.body;
  const newTopic = new Topic({ title, chapterId });
  try {
    const savedTopic = await newTopic.save();
    res.status(201).json({ success: true, data: savedTopic, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get all Topics of a Specific Chapter
// Access             Public user and admin both do this
const getChapterTopics = async (req, res) => {
  try {
    const { chapterId } = req.query;
    const topics = await Topic.find({ chapterId });
    res.status(201).json({ success: true, data: topics, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Edit Topic
// Access             Private -  only admin can do it
const editTopic = async (req, res, next) => {
  try {
    const editTopic = await Topic.findByIdAndUpdate(req.params.topicId);
    if (!editTopic) {
      return customError(StatusCodes.NOT_FOUND, res, "Subject not found");
    }
    if (editTopic.video) {
      // Delete the file
      fs.unlink(`./posts${editTopic.video}`, (err) => {
        if (err) {
          // console.error(err);
          const customError = new Error("error deleting the file");
          customError.status = 500; // Set the appropriate status code
          return next(customError);
        } else {
          // res.status(200).send("File deleted successfully");
        }
      });
    }
    // Update the subject properties from the request body
    Object.assign(editTopic, req.body);

    // Save the updated subject
    await editTopic.save();

    res.status(200).json({ success: true, data: editTopic, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Delete Topic
// Access             Private -  only admin can do it
const deleteTopic = async (req, res) => {
  try {
    const deleteTopic = await Topic.findByIdAndDelete(req.params.topicId);
    if (deleteTopic) {
      await Video.deleteOne({ topicId: req.params.topicId });
      await Mcq.deleteMany({ topicId: req.params.topicId });
      await Read.deleteMany({ topicId: req.params.topicId });
      res.status(203).json({
        success: true,
        data: "Topic Deleted Successfully",
        error: null,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "topic is not found");
    }
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

module.exports = {
  addTopic,
  getChapterTopics,
  editTopic,
  deleteTopic,
};
