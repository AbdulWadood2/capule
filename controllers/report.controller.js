const Report = require("../models/report.model"); // Import your Mongoose model
const Mcq = require("../models/mcqs.model"); // Import your Mongoose model
const Book = require("../models/book.model"); // Import your Mongoose model
const Video = require("../models/video.model"); // Import your Mongoose model
const User = require("../models/user.model"); // Import your Mongoose model
/* error */
const { customError } = require("../errors/custom.error");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
// @description       add report
// Access             public only user can do this
const addReport = async (req, res) => {
  try {
    const { mcqId, bookId, videoId, reason, reportType } = req.body;
    if (!reason) {
      return customError(StatusCodes.BAD_REQUEST, res, "reason must be added");
    }
    if (!reportType) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "reportType must be added"
      );
    }
    if ((mcqId && bookId) || (mcqId && videoId) || (bookId && videoId)) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Error: Only one of mcqId, bookId, or videoId should be added."
      );
    } else if (!(mcqId || bookId || videoId)) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Error: At least one of mcqId, bookId, or videoId must be added."
      );
    } else {
      if (mcqId) {
        const mcq = await Mcq.findById(mcqId);
        if (!mcq) {
          return customError(
            StatusCodes.BAD_REQUEST,
            res,
            "not mcq with this id"
          );
        }
      }
      if (bookId) {
        const book = await Book.findById(bookId);
        if (!book) {
          return customError(
            StatusCodes.BAD_REQUEST,
            res,
            "not book with this id"
          );
        }
      }
      if (videoId) {
        const video = await Video.findById(videoId);
        if (!video) {
          return customError(
            StatusCodes.BAD_REQUEST,
            res,
            "not video with this id"
          );
        }
      }
      const savedReport = await Report.create({
        userId: req.user.id,
        mcqId,
        bookId,
        videoId,
        reason,
        reportType,
      });
      res.status(StatusCodes.OK).json({
        success: true,
        data: "report is added",
        error: null,
        savedReport,
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
// @description       get all reports
// Access             private only admin can do this
const allReport = async (req, res) => {
  try {
    const extractReports = await Report.aggregate([
      {
        $lookup: {
          from: "users", // Assuming your user model is named "User"
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          userName: "$user.fullName",
        },
      },
      {
        $project: {
          user: 0, // Exclude the embedded user field
        },
      },
    ]);
    res.status(StatusCodes.OK).json({
      success: true,
      length: extractReports.length,
      data: extractReports,
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
// @description       get single report
// Access             private user can do this
const getSpecificRecord = async (req, res) => {
  try {
    const { reportId } = req.query;
    const report = await Report.findById(reportId);
    if (!report) {
      return customError(StatusCodes.NOT_FOUND, res, "Report not found");
    }
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: report, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       resolve single report
// Access             private user can do this
const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.query.reportId);
    if (!report) {
      return customError(StatusCodes.NOT_FOUND, res, "Report not found");
    }

    report.resolved = true;
    const updatedReport = await report.save();
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: updatedReport, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       delete report
// Access             private user can do this
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.query.reportId);
    if (!report) {
      return customError(StatusCodes.NOT_FOUND, res, "Report not found");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: "Report deleted successfully",
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
  addReport,
  allReport,
  getSpecificRecord,
  resolveReport,
  deleteReport,
};
