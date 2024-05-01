/* models */
const Read = require("../models/read.model");
const Mcq = require("../models/mcqs.model");
const Topic = require("../models/topic.model");
const Book = require("../models/book.model");
const User = require("../models/user.model");
const Video = require("../models/video.model");
/* error */
const { customError } = require("../errors/custom.error");
/* mongoose */
const mongoose = require("mongoose");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
// @description       read mcq
// Access             public only user can do this
const readMcqsInTopic = async (req, res) => {
  try {
    const { topicId } = req.query;
    let errors = [];
    if (!topicId) {
      errors.push("topicId");
    }
    if (errors.length > 0) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        errors.join(" and ") + " are not given"
      );
    }

    // Validate topicId as a valid MongoDB ObjectId
    if (topicId && !mongoose.Types.ObjectId.isValid(topicId)) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Invalid topicId format"
      );
    }

    // Ensure req.user.id is available
    if (!req.user || !req.user.id) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "User not authenticated"
      );
    }

    // Find all MCQs with the specified topicId
    const mcqsInTopic = await Mcq.find({ topicId });

    // Iterate through each MCQ in the topic
    for (const mcq of mcqsInTopic) {
      // Check if the MCQ has already been read by the user
      const alreadyRead = await Read.findOne({
        userId: req.user.id,
        topicId,
        mcqId: mcq._id,
      });

      if (!alreadyRead) {
        // If not already read, mark it as read
        await Read.create({
          userId: req.user.id,
          topicId,
          mcqId: mcq._id,
        });
      }
    }

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: "Read status added successfully for all MCQs in the topic",
      error: null,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       read book
// Access             public only user can do this
const readBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if bookId exists in req.body
    if (!bookId) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Missing bookId in the request body"
      );
    }

    // Validate bookId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return customError(StatusCodes.BAD_REQUEST, res, "Invalid bookId format");
    }

    // Ensure req.user.id is available
    if (!req.user || !req.user.id) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "User not authenticated"
      );
    }

    // Ensure user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return customError(StatusCodes.NOT_FOUND, res, "User not found");
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Book with this id does not exist"
      );
    }

    const read = await Read.findOne({
      userId: req.user.id,
      bookId,
    });

    if (read) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "already read",
        error: null,
      });
    } else {
      const newRead = await Read.create({
        userId: req.user.id,
        bookId,
      });

      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "Read status added successfully",
        error: null,
      });
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
// @description       read book mark mcq
// Access             public only user can do this
const readBookMarkMcq = async (req, res) => {
  try {
    const { bookMarkMcqId } = req.body;
    if (!bookMarkMcqId) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Missing bookMarkMcqId in the request body"
      );
    }
    // Validate bookMarkMcqId as a valid MongoDB ObjectId
    if (bookMarkMcqId && !mongoose.Types.ObjectId.isValid(bookMarkMcqId)) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Invalid bookMarkMcqId format"
      );
    }

    // Ensure req.user.id is available
    if (!req.user || !req.user.id) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "User not authenticated"
      );
    }

    // Ensure user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return customError(StatusCodes.NOT_FOUND, res, "User not found");
    }

    if (bookMarkMcqId) {
      // Convert ObjectId values to simple string representations
      const convertedData = user.bookmark.map((item) => ({
        mcqId: item.mcqId.toString(),
        chapterId: item.chapterId.toString(),
        _id: item._id.toString(),
      }));

      const bookMark = convertedData.find((item) => item._id === bookMarkMcqId);

      if (!bookMark) {
        return customError(
          StatusCodes.BAD_REQUEST,
          res,
          "BookMark with this id does not exist"
        );
      }
    }

    const read = await Read.findOne({
      userId: req.user.id,
      bookMarkMcqId,
    });

    if (read) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "already read",
        error: null,
      });
    } else {
      const newRead = await Read.create({
        userId: req.user.id,
        bookMarkMcqId,
      });

      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "Read status added successfully",
        error: null,
      });
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
// @description       read video
// Access             public only user can do this
const readVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Missing videoId in the request body"
      );
    }
    // Validate videoId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Invalid videoId format"
      );
    }

    // Ensure req.user.id is available
    if (!req.user || !req.user.id) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "User not authenticated"
      );
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Video with this id does not exist"
      );
    }

    const read = await Read.findOne({
      userId: req.user.id,
      videoId,
    });

    if (read) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "already read",
        error: null,
      });
    } else {
      const newRead = await Read.create({
        userId: req.user.id,
        videoId,
      });

      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "Read status added successfully",
        error: null,
      });
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
  readMcqsInTopic,
  readBook,
  readBookMarkMcq,
  readVideo,
};
