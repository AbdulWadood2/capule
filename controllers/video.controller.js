const Video = require("../models/video.model");
const Read = require("../models/read.model");

/* stutus codes */
const { StatusCodes } = require("http-status-codes");
/* error */
const { customError } = require("../errors/custom.error");
/* file System */
const fs = require("fs");

const { deleteFile } = require("../functions/utility.functions");

// @description       Add a Video
// Access             Private - Only admin can add it
const validateRequiredFields = (req, fields) => {
  const errors = [];
  for (const field of fields) {
    if (!req.body[field]) {
      errors.push(`${field}`);
    }
  }
  if (errors.length > 0) {
    return errors;
  }
  return null; // All required fields are present
};

const addVideo = async (req, res) => {
  try {
    const { stdClass, subjectId, chapterId, topicId, videoFile, thumbnail } =
      req.body;
    const requiredFields = [
      "stdClass",
      "subjectId",
      "chapterId",
      "topicId",
      "videoFile",
      "thumbnail",
    ];
    const missingField = validateRequiredFields(req, requiredFields);

    if (missingField) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        missingField.join(" and ") + " are required"
      );
    }

    // Continue with other validations and video creation logic

    const newVideo = await Video.create({
      stdClass,
      subjectId,
      chapterId,
      topicId,
      videoFile,
      thumbnail,
    });

    const savedVideo = await newVideo.save();
    res.status(201).json({ success: true, data: savedVideo, error: null });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.topicId) {
      // Duplicate key error on topicId
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "This topic already has a video"
      );
    }

    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get all Videos
// Access             Private only admin is able to see all videos on this plateform
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(201).json({ success: true, data: videos, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get all Videos of a Specific Subject or chapter or topic
// Access             Public user and admin both do this
const getSpecificVideos = async (req, res) => {
  try {
    const { subjectId, chapterId, topicId } = req.query;
    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;
    if (topicId) query.topicId = topicId;
    const videos = await Video.find(query);
    res.status(201).json({ success: true, data: videos, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get Single Video by _id
// Access             Public user and admin both do this
const getSingleVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.query.videoId);
    res.status(201).json({ success: true, data: video, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Edit Video
// Access             Private -  only admin can do it
const editVideo = async (req, res) => {
  try {
    const editVideo = await Video.findOne({ _id: req.query.videoId });
    if (req.body.videoFile) {
      // Delete the file
      fs.unlink(`./posts${editVideo.videoFile}`, (err) => {
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
    Object.assign(editVideo, req.body);
    await editVideo.save();
    res.status(201).json({ success: true, data: editVideo, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Delete Video
// Access             Private -  only admin can do it
const deleteVideo = async (req, res) => {
  try {
    const deleteVideo = await Video.findByIdAndDelete(req.query.videoId);
    if (deleteVideo) {
      await Read.deleteMany({ videoId: req.query.videoId });
      if (deleteVideo.videoFile) {
        await deleteFile(editVideo.videoFile);
      }
      res.status(203).json({
        success: true,
        data: "Video Deleted Successfully",
        error: null,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "video is not found");
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
  addVideo,
  getVideos,
  getSpecificVideos,
  getSingleVideo,
  editVideo,
  deleteVideo,
};
