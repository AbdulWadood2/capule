/* model */
const MockTest = require("../models/mockTest.model");
const Mcq = require("../models/mcqs.model");
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
  deleteFile,
} = require("../functions/utility.functions");
/*--x--x--*/
// @description       add mock Test
// Access             PRIVATE only admin can do it
const addMockTest = async (req, res, next) => {
  try {
    const { mockTestName } = req.body;
    if (!mockTestName) {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "mockTestName is not given in request"
      );
    }
    const mockTest = await MockTest.create({ mockTestName });
    if (mockTest) {
      return res.status(StatusCodes.CREATED).json({
        success: true,
        error: null,
        data: mockTest,
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
// @description       get all mock tests
// Access             PUBLIC only user can do it with token
const getAllMockTests = async (req, res, next) => {
  try {
    const mockTests = await MockTest.find();
    res.status(StatusCodes.OK).json({
      success: true,
      data: mockTests,
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
// @description       edit mock tests
// Access             PRIVATE only admin can do it
const editMockTests = async (req, res, next) => {
  try {
    const { mockTestId, mockTestName } = req.body;
    const errors = {};
    if (!mockTestId) {
      errors.mockTestId = "mockTestId is required";
    }
    if (!mockTestName) {
      errors.mockTestName = "mockTestName is required";
    }

    if (Object.keys(errors).length > 0) {
      return customError(StatusCodes.INTERNAL_SERVER_ERROR, res, errors);
    }
    const mockTest = await MockTest.findById(mockTestId);
    mockTest.mockTestName = mockTestName;
    mockTest.dateModified = Date.now();
    await mockTest.save();
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        message: "mock test is updated",
        mockTest,
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
// @description       delete mock tests
// Access             PRIVATE only admin can do it
const deleteMockTest = async (req, res, next) => {
  try {
    const { mockTestId } = req.body;
    const errors = {};
    if (!mockTestId) {
      errors.mockTestId = "mockTestId is required";
    }
    if (Object.keys(errors).length > 0) {
      return customError(StatusCodes.INTERNAL_SERVER_ERROR, res, errors);
    }
    const mockTestDelete = await MockTest.findByIdAndDelete(mockTestId);
    const deletedMcqs = await Mcq.find({ mockTestId });
    const deleteResult = await Mcq.deleteMany({ mockTestId });

    const fileDeletionPromises = deletedMcqs.map(async (deletedMcq) => {
      const fileDeletionPromises = [];

      if (deletedMcq.question.photo) {
        fileDeletionPromises.push(deleteFile(deletedMcq.question.photo));
      }
      if (deletedMcq.options.a.photo) {
        fileDeletionPromises.push(deleteFile(deletedMcq.options.a.photo));
      }
      if (deletedMcq.options.b.photo) {
        fileDeletionPromises.push(deleteFile(deletedMcq.options.b.photo));
      }
      if (deletedMcq.options.c.photo) {
        fileDeletionPromises.push(deleteFile(deletedMcq.options.c.photo));
      }
      if (deletedMcq.options.d.photo) {
        fileDeletionPromises.push(deleteFile(deletedMcq.options.d.photo));
      }
      if (deletedMcq.solution.photo) {
        fileDeletionPromises.push(deleteFile(deletedMcq.solution.photo));
      }

      await Promise.all(fileDeletionPromises);
    });

    await Promise.all(fileDeletionPromises);
    if (!mockTestDelete) {
      return customError(
        StatusCodes.NOT_FOUND,
        res,
        "no mockTest with this id"
      );
    }
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: {
        message: "mock test is deleted",
        mockTestDelete,
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
// @description       get mock tests
// Access             PUBLIC only user and admin can do it
const mockTestMcqs = async (req, res, next) => {
  try {
    const { mockTestId } = req.body;
    const mockTest = await MockTest.findById(mockTestId);

    if (!mockTest) {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "No mockTest with this id"
      );
    }

    const Mcqs = await Mcq.find({ mockTestId });

    if (Mcqs.length === 0) {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "No mcqs with this mockTestId"
      );
    }

    const randomSelection = await getRandomElementsFromArray(Mcqs, req.user);

    if (randomSelection.success) {
      res.status(StatusCodes.ACCEPTED).json({
        ...randomSelection,
      });
    } else {
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

async function getRandomElementsFromArray(arr, user) {
  try {
    if (arr.length === 0) {
      return {
        success: false,
        error: "No MCQs available",
        data: null,
      };
    }

    const randomElements = getRandomElementsFromArrayWithLimitation(
      arr,
      arr.length
    );

    if (randomElements.length > 0) {
      const elements = await addSubjectNameAndMarks(randomElements, Subject);
      const result = analyzeArray(elements);
      let modifyForBookMark;
      if (user.bookmark) {
        modifyForBookMark = addBookMarks(user, elements);
      } else {
        modifyForBookMark = elements;
      }
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
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addMockTest,
  getAllMockTests,
  editMockTests,
  deleteMockTest,
  mockTestMcqs,
};
