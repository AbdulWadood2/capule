const Book = require("../models/book.model");
const Read = require("../models/read.model");
const { customError } = require("../errors/custom.error");

const { StatusCodes } = require("http-status-codes");
// utility function
const { deleteFile } = require("../functions/utility.functions");

/* file system */
const fs = require("fs");

// @description       Add a Book
// Access             Private - Only admin can add it
const addBook = async (req, res) => {
  const newBook = new Book(req.body);
  try {
    const savedBook = await newBook.save();
    res.status(201).json({ success: true, data: savedBook, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get all Books
// Access             Private - Only admin can add it
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(201).json({ success: true, data: books, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get all Books of a Specific Subject
// Access             Public only [Admin and User] can do this
const getSubjectBooks = async (req, res) => {
  try {
    const books = await Book.find({ subjectId: req.params.subjectId });
    res.status(201).json({ success: true, data: books, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Get Single Book of a Specific Subject
// Access             Public only [Admin and User] can do this
const getSingleBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    res.status(201).json({ success: true, data: book, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Edit Book
// Access             Private -  only admin can do it
const editBook = async (req, res) => {
  try {
    const editBook = await Book.findByIdAndUpdate(req.params.bookId);

    if (!editBook) {
      return customError(StatusCodes.NOT_FOUND, res, "Subject not found");
    }
    function deleteSpecificFile(fileLocation) {
      if (fileLocation) {
        // Delete the file
        fs.unlink(`./posts${fileLocation}`, (err) => {
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
    }
    deleteSpecificFile(editBook.image);
    deleteSpecificFile(editBook.pdfFile);
    // Update the subject properties from the request body
    Object.assign(editBook, req.body);

    // Save the updated subject
    await editBook.save();

    res.status(200).json({ success: true, data: editBook, error: null });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

// @description       Delete Book
// Access             Private -  only admin can do it
const deleteBook = async (req, res) => {
  try {
    const deleteBook = await Book.findByIdAndDelete(req.params.bookId);
    await deleteFile(deleteBook.image);
    await deleteFile(deleteBook.pdfFile);
    await Read.deleteMany({
      bookId: req.params.bookId,
    });
    if (deleteBook) {
      res.status(203).json({
        success: true,
        data: "Book Deleted Successfully",
        error: null,
      });
    } else {
      return customError(StatusCodes.NOT_FOUND, res, "book is not found");
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
  addBook,
  getBooks,
  getSubjectBooks,
  getSingleBookDetails,
  editBook,
  deleteBook,
};
