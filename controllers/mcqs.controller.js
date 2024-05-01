const User = require("../models/user.model");
const Mcqs = require("../models/mcqs.model");
const Topic = require("../models/topic.model");
const Read = require("../models/read.model");
const Subject = require("../models/subject.model");
const CustomTest = require("../models/customTest.model");
const MockTest = require("../models/mockTest.model");
/* error */
const { customError } = require("../errors/custom.error");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* utility functions */
const {
  addBookMarks,
  getRandomElementsFromArrayWithLimitation,
  addSubjectNameAndMarks,
  analyzeArray,
  calculateTotalMarks,
  deleteFile,
} = require("../functions/utility.functions");
// @description       POST Mcqs
// Access             Private - Only admin can add it
const addMcqs = async (req, res) => {
  try {
    const {
      question,
      answerOptions,
      solution,
      options,
      subjectId,
      chapterId,
      topicId,
      correct,
      mockTestId,
      section,
    } = req.body;
    // is mock test with this id exists ?
    if (mockTestId) {
      const mockTest = await MockTest.findById(mockTestId);
      if (!mockTest) {
        return customError(
          StatusCodes.BAD_REQUEST,
          res,
          `no mock test with ${mockTestId}`
        );
      }
    }
    const answerOptionsAre = [];
    if (answerOptions) {
      Object.keys(answerOptions).forEach((key) => {
        answerOptionsAre.push(key);
      });
    }
    const optionsAre = [];
    if (options) {
      Object.keys(options).forEach((key) => {
        optionsAre.push(key);
      });
    }
    // here i set correct : true at right place
    if (correct) {
      if (answerOptionsAre.includes("e") || optionsAre.includes("e")) {
        // Array of allowed values
        let allowedValues = ["a", "b", "c", "d", "e"];

        // Check if the variable is in the allowed values
        if (allowedValues.includes(correct)) {
        } else {
          return customError(
            StatusCodes.BAD_REQUEST,
            res,
            `correct is not includes ["a", "b", "c", "d", "e"]`
          );
        }
      } else {
        // Array of allowed values
        let allowedValues = ["a", "b", "c", "d"];

        // Check if the variable is in the allowed values
        if (allowedValues.includes(correct)) {
        } else {
          return customError(
            StatusCodes.BAD_REQUEST,
            res,
            `correct is not includes ["a", "b", "c", "d"]`
          );
        }
      }
    } else {
      return customError(StatusCodes.BAD_REQUEST, res, "correct is required");
    }
    // Validation function
    function validateOptions(options) {
      let optionKeys;
      optionKeys = ["a", "b", "c", "d"];

      // Check if any option is given
      const isAnyOptionGiven = optionKeys.some(
        (key) => options[key] !== undefined && options[key] !== null
      );

      // If no option is given, it's okay
      if (!isAnyOptionGiven) {
        return true;
      }

      // Check if all options are given
      const areAllOptionsGiven = optionKeys.every(
        (key) => options[key] !== undefined && options[key] !== null
      );

      if (!areAllOptionsGiven) {
        throw new Error(
          "If any option (a, b, c, d) is given, all options must be given."
        );
      }

      // Check if any option has both text and photo
      const hasOptionWithBothTextAndPhoto = optionKeys.some(
        (key) =>
          options[key] &&
          options[key].text !== undefined &&
          options[key].photo !== undefined
      );

      if (hasOptionWithBothTextAndPhoto) {
        throw new Error('Any option cannot have both "text" and "photo".');
      }

      // Check if text or photo is truthy value if present
      optionKeys.forEach((key) => {
        if (options[key] && options[key].text && !options[key].text.trim()) {
          throw new Error(`Option ${key} has falsy value for "text".`);
        }
        if (options[key] && options[key].photo && !options[key].photo.trim()) {
          throw new Error(`Option ${key} has falsy value for "photo".`);
        }
        if (!options[key].text && !options[key].photo) {
          throw new Error(
            `Either "text" or "photo" must be a truthy value for option ${key}.`
          );
        }
      });

      return true;
    }

    if (options) {
      // Usage
      try {
        validateOptions(options);
      } catch (error) {
        return customError(StatusCodes.BAD_REQUEST, res, error.message);
      }
    }
    const errors = {};
    if (!question) {
      errors.question = "Question is required";
    }
    if (!solution) {
      errors.solution = "Solution is required";
    }
    if (!section) {
      errors.section = "section is required";
    }

    if (Object.keys(errors).length > 0) {
      return customError(StatusCodes.INTERNAL_SERVER_ERROR, res, errors);
    }
    // const newMcqs = new Mcqs();
    const savedMcqs = await Mcqs.create({
      question,
      options,
      solution,
      answerOptions,
      subjectId,
      chapterId,
      topicId,
      mockTestId,
      section,
    });
    Object.keys(savedMcqs.answerOptions.toObject()).forEach((key) => {
      savedMcqs.answerOptions[key].isCorrect = key === correct;
    });
    let data = JSON.parse(JSON.stringify(savedMcqs.options));
    if (savedMcqs.toObject().options) {
      Object.keys(data).forEach((key) => {
        if (key === "e") {
          if (savedMcqs.answerOptions[key].text) {
          } else {
            savedMcqs.answerOptions[key].text = "E";
          }
          savedMcqs.answerOptions[key].isCorrect = key === correct;
        }
      });
    }
    // // Set isCorrect to true for the correct option
    // savedMcqs.answerOptions[correct].isCorrect = true;
    await savedMcqs.save();
    res.status(201).json({ success: true, data: savedMcqs, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// @description       GET Mcqs
// Access             Public only user, admin can do this
const getMcqs = async (req, res) => {
  try {
    const { subjectId, chapterId, topicId } = req.query;
    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;
    if (topicId) query.topicId = topicId;

    let mcqs = await Mcqs.find(query);
    if (!(mcqs.length > 0)) {
      return customError(StatusCodes.BAD_REQUEST, res, "mcqs are zero");
    }
    const randomSelection = await getRandomElementsFromArray(
      mcqs,
      mcqs.length,
      req.user
    );
    if (randomSelection.success) {
      res.status(StatusCodes.ACCEPTED).json({
        ...randomSelection,
      });
    } else if (randomSelection.success == false) {
      res.status(StatusCodes.BAD_REQUEST).json({
        ...randomSelection,
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
async function getRandomElementsFromArray(arr, numElements, user) {
  if (arr.length >= numElements) {
    let randomElements = getRandomElementsFromArrayWithLimitation(
      arr,
      numElements
    );
    let elements = await addSubjectNameAndMarks(randomElements, Subject);
    let modifyForBookMark;
    if (user.bookmark) {
      modifyForBookMark = addBookMarks(user, elements);
    } else {
      modifyForBookMark = elements;
    }
    const result = analyzeArray(elements);
    const totalMarks = calculateTotalMarks(result);

    return {
      success: true,
      length: randomElements.length,
      data: {
        mcqs: modifyForBookMark,
        marksDistribution: result,
        totalMarks,
      },
      error: null,
    };
  } else {
    return {
      success: false,
      error: `total mcqs are ${arr.length} so plz enter less then or equal to them`,
      data: null,
    };
  }
}

// @description       GET Single Mcqs
// Access             Public only user, admin can do this
const getSingleMcq = async (req, res) => {
  try {
    const { mcqId } = req.query;
    if (!mcqId) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "mcqId is required in req"
      );
    }
    // const user = await User.findById(req.user.id);
    const singleMcq = await Mcqs.findById(mcqId);
    if (!singleMcq) {
      return customError(
        StatusCodes.NOT_FOUND,
        res,
        "mcq not found in database"
      );
    }
    let mcq;
    if (req.user.bookmark) {
      mcq = addBookMarks(req.user, [{ ...singleMcq._doc }]);
    } else {
      mcq = [singleMcq];
    }
    if (mcq[0]) {
      res.status(201).json({ success: true, data: mcq[0], error: null });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "mcq not found");
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

// @description       PUT Edit MCQs
// Access             Private -  only admin can do it
const editMcqs = async (req, res, next) => {
  try {
    const editMcqs = await Mcqs.findOne({ _id: req.params.mcqsId });
    editMcqs.dateModified = Date.now();
    Object.assign(editMcqs, req.body);
    await editMcqs.save();
    res.status(201).json({ success: true, data: editMcqs, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       DELETE MCQs
// Access             Private -  only admin can do it
const deleteMcqs = async (req, res) => {
  try {
    const { mcqId } = req.query;
    const Mcq = await Mcqs.findById(mcqId);
    if (!Mcq) {
      return customError(StatusCodes.NOT_FOUND, res, "mcq not found");
    }
    /* delete all read mcqs */
    const read = await Read.deleteMany({ mcqId });
    /* delete question quantity is custom test if question quantity is equal to availiable mcqs */
    const customTests = await CustomTest.find({
      topics: Mcq.topicId,
    });
    for (let item of customTests) {
      const mcqs = await Mcqs.find({ topicId: { $in: item.topics } });
      const totalLength = mcqs.length;
      if (totalLength == item.questionQuantity) {
        const customTest = await CustomTest.findById(item._id);
        customTest.questionQuantity = customTest.questionQuantity - 1;
        await customTest.save();
      }
    }
    const deleteMcqs = await Mcqs.findByIdAndDelete(mcqId);
    /* this is the function for delete files for specific location  */
    const message = [];
    if (deleteMcqs.question.photo) {
      await deleteFile(deleteMcqs.question.photo);
    }
    if (deleteMcqs.options.a.photo) {
      await deleteFile(deleteMcqs.options.a.photo);
    }
    if (deleteMcqs.options.b.photo) {
      await deleteFile(deleteMcqs.options.b.photo);
    }
    if (deleteMcqs.options.c.photo) {
      await deleteFile(deleteMcqs.options.c.photo);
    }
    if (deleteMcqs.options.d.photo) {
      await deleteFile(deleteMcqs.options.d.photo);
    }
    if (deleteMcqs.solution.photo) {
      await deleteFile(deleteMcqs.solution.photo);
    }
    if (deleteMcqs) {
      res.status(203).json({
        success: true,
        data: "Mcq Deleted Successfully",
        error: null,
        message,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "mcq is not found");
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
  addMcqs,
  getMcqs,
  getSingleMcq,
  editMcqs,
  deleteMcqs,
};
