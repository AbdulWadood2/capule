/* models */
const Chapter = require("../models/chapter.model");
const Topic = require("../models/topic.model");
const Book = require("../models/book.model");
const Video = require("../models/video.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Mcq = require("../models/mcqs.model");
const Read = require("../models/read.model");

const { deleteFile } = require("../functions/utility.functions");

/* status Code package */
const { StatusCodes } = require("http-status-codes");
/* error */
const { customError } = require("../errors/custom.error");
/* utility functions */
// read functionalities
// async function percentageAndReadOfChapters(req, chapterId, userId) {
//   const topics = await Topic.find({ chapterId: chapterId });
//   const modifiedTopics = await Promise.all(
//     topics.map(async (topic) => {
//       const mcqs = await Mcq.find({ topicId: topic._id });
//       return {
//         ...topic.toObject(),
//         mcqsNumber: mcqs.length,
//       };
//     })
//   );

//   let readTopic = 0;

//   await Promise.all(
//     modifiedTopics.map(async (item) => {
//       const readmcqs = await Read.find({
//         topicId: item._id,
//         userId: req.user.id,
//       });
//       if (readmcqs.length == item.mcqsNumber) {
//         readTopic++;
//       }
//     })
//   );

//   const books = await Book.find({ chapterId: chapterId });
//   let readBook = 0;

//   await Promise.all(
//     books.map(async (item) => {
//       const readbook = await Read.findOne({
//         bookId: item._id,
//         userId: req.user.id,
//       });
//       if (readbook) {
//         readBook++;
//       }
//     })
//   );

//   const videosIs = await Video.find({ chapterId: chapterId });
//   let videos = await Promise.all(
//     videosIs.map(async (item) => {
//       const topic = await Topic.findById(item.topicId);
//       return {
//         ...item._doc,
//         title: topic.title,
//       };
//     })
//   );

//   let readVideos = 0;
//   await Promise.all(
//     videos.map(async (item) => {
//       const readvideo = await Read.findOne({
//         userId: req.user.id,
//         videoId: item._id,
//       });
//       if (readvideo) {
//         readVideos++;
//       }
//     })
//   );

//   let bookmarkmcqs = await User.findOne({ _id: userId }).select("bookmark");
//   let admin = await Admin.findById(userId);
//   bookmarkmcqs = bookmarkmcqs ? bookmarkmcqs : admin;
//   bookmarkmcqs = bookmarkmcqs.bookmark ? bookmarkmcqs.bookmark : false;
//   let bookmarkRead = 0;
//   if (bookmarkmcqs) {
//     bookmarkmcqs = bookmarkmcqs.filter((item) => {
//       if (item.chapterId.toString() == chapterId.toString()) {
//         return true;
//       } else {
//         return false;
//       }
//     });
//     for (let item of bookmarkmcqs) {
//       const readvideo = await Read.findOne({
//         userId: req.user.id,
//         bookMarkMcqId: item._id,
//       });
//       if (readvideo) {
//         bookmarkRead++;
//       }
//     }
//   }
//   return {
//     topics: modifiedTopics,
//     books,
//     videos,
//     bookmarkmcqs,
//     read: {
//       mcq: {
//         number: topics.length,
//         read: readTopic,
//         percentage: (readTopic / topics.length) * 100,
//       },
//       book: {
//         number: books.length,
//         read: readBook,
//         percentage: (readBook / books.length) * 100,
//       },
//       revise: {
//         number: videosIs.length + bookmarkmcqs.length,
//         read: readVideos + bookmarkRead,
//         percentage:
//           ((readVideos + bookmarkRead) /
//             (videos.length + bookmarkmcqs.length)) *
//           100,
//       },
//       totalPercentage: isNaN(
//         ((readTopic / topics.length) * 100 +
//           (readBook / books.length) * 100 +
//           ((readVideos + bookmarkRead) /
//             (videos.length + bookmarkmcqs.length)) *
//             100) /
//           3
//       )
//         ? 0
//         : ((readTopic / topics.length) * 100 +
//             (readBook / books.length) * 100 +
//             ((readVideos + bookmarkRead) /
//               (videos.length + bookmarkmcqs.length)) *
//               100) /
//           3,
//     },
//   };
// }
async function percentageAndReadOfChapters(req, chapterId, userId) {
  try {
    // Use lean() for plain JavaScript objects
    const topics = await Topic.find({ chapterId: chapterId }).lean();

    // Use countDocuments to get the count directly from the database
    const modifiedTopics = await Promise.all(
      topics.map(async (topic) => {
        const mcqsNumber = await Mcq.countDocuments({ topicId: topic._id });
        return {
          ...topic,
          mcqsNumber,
        };
      })
    );

    let readTopic = 0;

    await Promise.all(
      modifiedTopics.map(async (item) => {
        // Use countDocuments for counting
        const readmcqs = await Read.countDocuments({
          topicId: item._id,
          userId: req.user.id,
        });
        if (readmcqs === item.mcqsNumber) {
          readTopic++;
        }
      })
    );

    // Use countDocuments for counting
    const books = await Book.find({ chapterId: chapterId }).lean();
    const readBook = await Read.countDocuments({
      bookId: { $in: books.map((item) => item._id) },
      userId: req.user.id,
    });

    const videosIs = await Video.find({ chapterId: chapterId }).lean();
    let videos = await Promise.all(
      videosIs.map(async (item) => {
        const topic = await Topic.findById(item.topicId).lean();
        return {
          ...item,
          title: topic.title,
        };
      })
    );

    let readVideos = 0;
    await Promise.all(
      videos.map(async (item) => {
        // Use countDocuments for counting
        const readvideo = await Read.countDocuments({
          userId: req.user.id,
          videoId: item._id,
        });

        if (readvideo) {
          readVideos++;
        }
      })
    );

    let bookmarkmcqs = await User.findOne({ _id: userId })
      .select("bookmark")
      .lean();
    let admin = await Admin.findById(userId).lean();
    bookmarkmcqs = bookmarkmcqs ? bookmarkmcqs : admin;
    bookmarkmcqs = bookmarkmcqs.bookmark ? bookmarkmcqs.bookmark : false;
    let bookmarkRead = 0;
    if (bookmarkmcqs) {
      bookmarkmcqs = bookmarkmcqs.filter(
        (item) => item.chapterId.toString() === chapterId.toString()
      );

      // Extract the bookmarkmcqIds
      const bookmarkmcqIds = bookmarkmcqs.map((item) => item._id);

      // Use countDocuments for counting directly in the database
      bookmarkRead = await Read.countDocuments({
        userId: req.user.id,
        bookMarkMcqId: { $in: bookmarkmcqIds },
      });
    }

    const totalTopics = topics.length;
    const totalBooks = books.length;
    // bookmarkmcqs = bookmarkmcqs ? bookmarkmcqs : ;
    let totalVideos;
    totalVideos = videos.length;
    const topicPercentage =
      totalTopics == 0 ? 100 : (readTopic * 100) / totalTopics;
    const percentageBook =
      totalBooks == 0 ? 100 : (readBook * 100) / totalBooks;
    const revisePercentage =
      totalVideos + bookmarkmcqs.length == 0
        ? 100
        : ((readVideos + bookmarkRead) * 100) /
          (totalVideos + bookmarkmcqs.length);
    return {
      topics: modifiedTopics,
      books,
      videos,
      bookmarkmcqs: bookmarkmcqs ? bookmarkmcqs : [],
      read: {
        mcq: {
          number: totalTopics,
          read: readTopic,
          percentage: topicPercentage,
        },
        book: {
          number: totalBooks,
          read: readBook,
          percentage: percentageBook,
        },
        revise: {
          number: totalVideos + (bookmarkmcqs ? bookmarkmcqs.length : 0),
          read: readVideos + bookmarkRead,
          percentage: revisePercentage,
        },
        totalPercentage:
          (topicPercentage + percentageBook + revisePercentage) / 3,
      },
    };
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    throw new Error("An error occurred");
  }
}
/* ----x----x---- */

// @description       Add a Chapter
// Access             Private - Only admin can add it
const addChapter = async (req, res) => {
  const { title, subjectId, img } = req.body;
  const newChapter = new Chapter({ title, subjectId, img });
  try {
    const savedChapter = await newChapter.save();
    res.status(201).json({ success: true, data: savedChapter, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get all Chapters of a Specific Subject
// Access             Public only [admin,user] can do this
const getSubjectChapters = async (req, res) => {
  try {
    if (!req.params.subjectId) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "subjectId is required for this action"
      );
    }
    let chapters = await Chapter.find({ subjectId: req.params.subjectId });
    let index = 0;
    for (let item of chapters) {
      item = item.toObject();
      const totalReadPercentage = await percentageAndReadOfChapters(
        req,
        item._id,
        req.user.id
      );
      chapters[index] = {
        ...item,
        totalReadPercentage: totalReadPercentage.read.totalPercentage,
      };
      index++;
    }
    res.status(201).json({ success: true, data: chapters, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Edit Chapter
// Access             Private -  only admin can do it
const editChapter = async (req, res) => {
  try {
    const editChapter = await Chapter.findByIdAndUpdate(
      req.params.chapterId,
      req.body,
      { new: true }
    );
    res.status(201).json({ success: true, data: editChapter, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Delete Chapter
// Access             Private -  only admin can do it
const deleteChapter = async (req, res) => {
  try {
    const deleteChapter = await Chapter.findByIdAndDelete(req.params.chapterId);
    await deleteFile(deleteChapter.img);
    if (deleteChapter) {
      const topics = await Topic.find({ chapterId: req.params.chapterId });
      if (topics) {
        for (let item of topics) {
          await Topic.findByIdAndDelete(item.id);
          await Video.deleteOne({ topicId: item.id });
          await Mcq.deleteMany({ topicId: item.id });
          await Read.deleteMany({ topicId: item.id });
        }
      }
      res.status(203).json({
        success: true,
        data: "Chapter Deleted Successfully",
        error: null,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "chapter is not found");
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

// @description       GET Chapter Info
// Access             Public only [admin user] can do this
const getChapterInfo = async (req, res) => {
  try {
    const { chapterId } = req.body;
    const totalReadPercentage = await percentageAndReadOfChapters(
      req,
      chapterId,
      req.user.id
    );
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: totalReadPercentage,
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

// @description       GET Chapter Topics
// Access             Public only [admin user] can do this
const getChaptersTopics = async (req, res) => {
  try {
    const { chapters } = req.body;
    if (!chapters) {
      return customError(StatusCodes.BAD_REQUEST, res, "chapters is missimg");
    }
    const TopicsArray = [];
    for (let item of chapters) {
      const chapters = await Topic.find({ chapterId: item });
      for (let item2 of chapters) {
        TopicsArray.push({ ...item2._doc });
      }
    }
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: TopicsArray,
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
  addChapter,
  getSubjectChapters,
  editChapter,
  deleteChapter,
  getChapterInfo,
  getChaptersTopics,
};
