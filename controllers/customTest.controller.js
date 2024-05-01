/* model */
const Topic = require("../models/topic.model");
const Mcqs = require("../models/mcqs.model");
const CustomTest = require("../models/customTest.model");
const Subject = require("../models/subject.model");
const User = require("../models/user.model");
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
} = require("../functions/utility.functions");
/*--x--x--*/
// @description       add Custom Test
// Access             PUBLIC only [user] can do this
const addCustomTest = async (req, res, next) => {
  try {
    const { name, questionQuantity, chapters } = req.body;
    const topics = await Topic.find({ chapterId: { $in: chapters } });
    let spreadTest = [];
    // Use map to create an array of Promises for each item in allCustomTests
    async function collectMcqs(item) {
      const mcqs = await Mcqs.find({
        topicId: item,
      });
      spreadTest.push(...mcqs);
    }
    for (let item of topics) {
      await collectMcqs(item);
    }
    if (!(spreadTest.length == 0)) {
      if (spreadTest.length >= questionQuantity) {
        const customTest = await CustomTest.create({
          name,
          questionQuantity,
          topics,
          userId: req.user.id,
        });
        res.status(StatusCodes.OK).json({
          success: true,
          data: "custom test is added",
          error: null,
          customTest,
        });
      } else {
        return customError(
          StatusCodes.BAD_REQUEST,
          res,
          `total availiable mcqs are ${spreadTest.length} so enter less then or equal to these`
        );
      }
    } else {
      res.status(StatusCodes.EXPECTATION_FAILED).json({
        success: false,
        data: null,
        error: "no custom mcqs with these topics",
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
// @description       get all custom tests
// Access             PUBLIC only [user] can do this
const customTests = async (req, res, next) => {
  try {
    const customTests = await CustomTest.find({ userId: req.user.id });
    res.status(StatusCodes.OK).json({
      success: true,
      data: customTests,
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
// @description       get all custom mcqs
// Access             PUBLIC only [user] can do this
const getAllCustomMcqs = async (req, res, next) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    const { topics, questionQuantity } = req.body;
    if (!questionQuantity) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "questionQuantity field is not provided in req"
      );
    }
    if (!(questionQuantity >= 0)) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "questionQuantity field must be a positive value"
      );
    }
    if (!topics) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "topics field must be required"
      );
    }
    if (topics.length == 0) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "topics array should not be empty"
      );
    }
    let spreadTest = [];

    // Use map to create an array of Promises for each item in topics
    const mcqPromises = topics.map(async (item) => {
      const mcqs = await Mcqs.find({ topicId: item });
      return { mcqs };
    });

    // Wait for all MCQs requests to complete
    const mcqResults = await Promise.all(mcqPromises);
    // Concatenate the results to spreadTest
    spreadTest = mcqResults
      .map((result) => result.mcqs.map((mcq) => mcq))
      .flat();
    if (spreadTest.length == 0) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "not mcqs from these topics"
      );
    }

    // Get 5 random elements from the array

    const randomSelection = await getRandomElementsFromArray(
      spreadTest,
      questionQuantity,
      user
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
    if (randomElements.length > 0) {
      const elements = await addSubjectNameAndMarks(randomElements, Subject);
      const result = analyzeArray(elements);
      const modifyForBookMark = addBookMarks(user, elements);
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
        error: "No MCQs available",
        data: null,
      };
    }
  } else {
    return {
      success: false,
      error: `total mcqs are ${arr.length} so plz enter less then or equal to them`,
      data: null,
    };
  }
}
// @description       edit custom test
// Access             PUBLIC only [user] can do this
const editCustomTest = async (req, res, next) => {
  try {
    const { name, questionQuantity, topics } = req.body;
    const { customTestId } = req.query;
    const customTest = await CustomTest.findOne({
      _id: customTestId,
      userId: req.user.id,
    });

    if (!customTest) {
      return customError(StatusCodes.NOT_FOUND, res, "Custom test not found");
    }
    let spreadTest = [];
    if (topics) {
      customTest.topics = topics;

      async function collectMcqs(item) {
        const mcqs = await Mcqs.find({
          topicId: item,
          type: "custom",
        });
        spreadTest.push(...mcqs);
      }

      for (let item of topics) {
        await collectMcqs(item);
      }
    } else {
      // customTest.topics = topics;
      async function collectMcqs(item) {
        const mcqs = await Mcqs.find({
          topicId: item,
          type: "custom",
        });
        spreadTest.push(...mcqs);
      }
      for (let item of customTest.topics) {
        await collectMcqs(item);
      }
    }

    if (questionQuantity !== undefined && questionQuantity < 0) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Question quantity cannot be negative"
      );
    }

    if (
      questionQuantity !== undefined &&
      spreadTest.length < questionQuantity
    ) {
      customTest.questionQuantity = spreadTest.length;
      req.message = ` total availiable mcqs are ${spreadTest.length} so we added ${spreadTest.length}`;
    } else {
      if (questionQuantity !== undefined) {
        customTest.questionQuantity = questionQuantity;
      }
    }

    // Update customTest only if the fields in req.body exist and are not false
    if (name !== undefined) {
      customTest.name = name;
    }

    await customTest.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Custom test is updated${req.message ? req.message : ""}`,
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
// @description       delete custom test
// Access             PUBLIC only [user] can do this
const deleteCustomTest = async (req, res, next) => {
  try {
    const { customTestId } = req.query;
    const test = await CustomTest.findOne({
      _id: customTestId,
      userId: req.user.id,
    });
    if (test) {
      await CustomTest.findOneAndDelete({
        _id: customTestId,
        userId: req.user.id,
      }).then((result) => {
        if (result) {
          res.status(StatusCodes.ACCEPTED).json({
            success: true,
            error: null,
            data: "custom test deleted",
          });
        } else {
          return customError(
            StatusCodes.NOT_FOUND,
            res,
            "custom test not found"
          );
        }
      });
    } else {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "you are not autorize user"
      );
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
  addCustomTest,
  customTests,
  getAllCustomMcqs,
  editCustomTest,
  deleteCustomTest,
};
