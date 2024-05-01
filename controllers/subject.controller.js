const Subject = require("../models/subject.model");
const Chapter = require("../models/chapter.model");
const Topic = require("../models/topic.model");
/* error */
const { customError } = require("../errors/custom.error");
/* file system */
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");

const { deleteFile } = require("../functions/utility.functions");

// @description       Add a Subject
// Access             Private - Only admin can add it
const addSubject = async (req, res) => {
  const { title, stdClass, image, perMcqMark } = req.body;
  const newSubject = new Subject({ title, stdClass, image, perMcqMark });
  try {
    const savedSubject = await newSubject.save();
    res.status(201).json({ success: true, data: savedSubject, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       get all subjects
// Access             Private - Only admin can add it
const getAllSubjects = async (req, res) => {
  try {
    const allSubects = await Subject.find();
    res.status(201).json({ success: true, data: allSubects, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       get all subjects of class 11
// Access             Public -  but mean valid token is required to view
const getSubjectsOfClass11 = async (req, res) => {
  try {
    const class11Subjects = await Subject.find({ stdClass: "11" });
    res.status(201).json({ success: true, data: class11Subjects, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       get all subjects of class 12
// Access             Public -  but mean valid token is required to view
const getSubjectsOfClass12 = async (req, res) => {
  try {
    const class12Subjects = await Subject.find({ stdClass: "12" });
    res.status(201).json({ success: true, data: class12Subjects, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       edit Subject
// Access             Private -  only admin can do it
const editSubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;

    // Find the subject by its ID
    const existingSubject = await Subject.findById(subjectId);

    if (!existingSubject) {
      return customError(StatusCodes.NOT_FOUND, res, "Subject not found");
    }
    if (existingSubject.image) {
      // Delete the file
      fs.unlink(`./posts${existingSubject.image}`, (err) => {
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
    Object.assign(existingSubject, req.body);

    // Save the updated subject
    await existingSubject.save();

    res.status(200).json({ success: true, data: existingSubject, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       delete Subject
// Access             Private -  only admin can do it
const deleteSubject = async (req, res) => {
  try {
    const deleteSubject = await Subject.findByIdAndDelete(req.params.subjectId);
    await deleteFile(deleteSubject.image);
    if (deleteSubject) {
      const chapters = await Chapter.find({
        subjectId: deleteSubject.id,
      });
      if (chapters) {
        for (let item of chapters) {
          const deleteChapter = await Chapter.findByIdAndDelete(item.id);
          if (deleteChapter) {
            const topics = await Topic.find({
              chapterId: deleteChapter.id,
            });
            if (topics) {
              for (let item of topics) {
                await Topic.findByIdAndDelete(item.id);
                await Video.deleteOne({ topicId: item.id });
                await Mcq.deleteMany({ topicId: item.id });
                await Read.deleteMany({ topicId: item.id });
              }
            }
          }
        }
      }
      res.status(203).json({
        success: true,
        data: "Subject Deleted Successfully",
        error: null,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "subject is not found");
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

// @description       GET subjectsChapters
// Access             PUBLIC user and admin
const getSubjectsChapters = async (req, res) => {
  try {
    const { subjects } = req.body;
    if (!subjects) {
      return customError(StatusCodes.BAD_REQUEST, res, "subjects is missimg");
    }
    const chaptersArray = [];
    for (let item of subjects) {
      const chapters = await Chapter.find({ subjectId: item._id });
      for (let item2 of chapters) {
        chaptersArray.push({ ...item2._doc, subjectTitle: item.title });
      }
    }
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: chaptersArray,
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
  addSubject,
  getAllSubjects,
  getSubjectsOfClass11,
  getSubjectsOfClass12,
  editSubject,
  deleteSubject,
  getSubjectsChapters,
};
