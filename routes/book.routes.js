const {
  addBook,
  getBooks,
  getSubjectBooks,
  getSingleBookDetails,
  editBook,
  deleteBook,
} = require("../controllers/book.controller");
const { verifyToken, verifyTokenAndAdmin, verifyAll } = require("../utils/verifyToken");

const router = require("express").Router();

// @description       Add a Book
// Access             Private - Only admin can add it
router.post("/add", verifyTokenAndAdmin, addBook);
// @description       Get all Books
// Access             Private - Only admin can add it
router.get("/", verifyTokenAndAdmin, getBooks);
// @description       Get all Books of a Specific Subject
// Access             Public only [Admin and User] can do this
router.get("/:subjectId/books", verifyAll, getSubjectBooks);
// @description       Get Single Book of a Specific Subject
// Access             Public only [Admin and User] can do this
router.get("/:bookId", verifyAll, getSingleBookDetails);
// @description       Edit Book
// Access             Private -  only admin can do it
router.put("/edit/:bookId", verifyTokenAndAdmin, editBook);
// @description       Delete Book
// Access             Private -  only admin can do it
router.delete("/delete/:bookId", verifyTokenAndAdmin, deleteBook);

module.exports = router;
