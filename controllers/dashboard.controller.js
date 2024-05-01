const { customError } = require("../errors/custom.error");
const userModel = require("../models/user.model");
const subjectModel = require("../models/subject.model");
const mcqsModel = require("../models/mcqs.model");
const bookModel = require("../models/book.model");
const videoModel = require("../models/video.model");
const reportModel = require("../models/report.model");
const { StatusCodes } = require("http-status-codes");

// @description       get Items In Number
// Access             PRIVATE only admin can do it
const getItemsInNumber = async (req, res, next) => {
  try {
    const [users, subjects, mcqs, books, videos, reports] = await Promise.all([
      userModel.find(),
      subjectModel.find(),
      mcqsModel.find(),
      bookModel.find(),
      videoModel.find(),
      reportModel.find(),
    ]);
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users: users.length,
        subjects: subjects.length,
        mcqs: mcqs.length,
        books: books.length,
        videos: videos.length,
        reports: reports.length,
      },
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
  getItemsInNumber,
};
