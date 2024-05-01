/* error */
const { customError } = require("../errors/custom.error");
//model
const Read = require("../models/read.model");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* models */
const User = require("../models/user.model");
// @description       Create Book makes
// Access             PUBLIC only [user] can do this
const createBookMarkMCQS = async (req, res) => {
  try {
    const { chapterId, mcqId, photo, text } = req.body;

    if (mcqId) {
      const user = await User.findOne({ _id: req.user.id });
      let mcqExist = user.bookmark.filter((item) => {
        if (item.mcqId == mcqId) {
          return true;
        }
      });
      if (!(mcqExist.length == 0)) {
        const read = await Read.deleteOne({
          bookMarkMcqId: mcqExist[0]._id,
          userId: req.user.id,
        });
        const result = await User.updateOne(
          { _id: req.user.id }, // Query to find the document
          { $pull: { bookmark: { _id: mcqExist[0]._id } } } // Remove the specific object
        );

        if (result.modifiedCount > 0) {
          return res.status(200).json({
            success: true,
            data: "book mark remove successfully",
            error: null,
          });
        } else {
          return customError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            res,
            "error removing bookmark"
          );
        }
      }
      user.bookmark.push({ chapterId, mcqId, photo, text });
      await user.save();
      return res.status(StatusCodes.OK).json({
        success: true,
        data: "bookmark added",
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

// @description       get all bookMarks MCQS
// Access             PUBLIC only [user] can do this
const getAllbookMarksMCQS = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const { chapterId } = req.body;
    const topicMcqs = user.bookmark.filter((item) => {
      if (item.chapterId == chapterId) {
        return true;
      } else {
        return false;
      }
    });
    if (topicMcqs.length == 0) {
      return customError(
        StatusCodes.NOT_FOUND,
        res,
        "no bookmark mcqs for this chapter"
      );
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: topicMcqs,
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

module.exports = {
  createBookMarkMCQS,
  getAllbookMarksMCQS,
};
