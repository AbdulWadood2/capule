const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToDatabase = require("./connection");

/* error */
const { customError } = require("./errors/custom.error");

/* status codes */
const { StatusCodes } = require("http-status-codes");

// Import all routers
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.route");
const subjectRouter = require("./routes/subject.routes");
const chapterRouter = require("./routes/chapter.routes");
const topicRouter = require("./routes/topic.routes");
const mcqsRouter = require("./routes/mcqs.routes");
const customTestRouter = require("./routes/customTest.routes");
const bookRouter = require("./routes/book.routes");
const videoRouter = require("./routes/video.routes");
const contactRouter = require("./routes/contact.routes");
const fileSystemRouter = require("./routes/fileSystem.routes");
const bookmarkRouter = require("./routes/bookmark.routes");
const reportRouter = require("./routes/report.routes");
const readRouter = require("./routes/read.routes");
const mockTest = require("./routes/mockTest.route");
const dashboard = require("./routes/dashboard.routes");

// Define the desired folder structure
const folderStructure = [
  "posts",
  "posts/books",
  "posts/books/imgs",
  "posts/books/pdfs",
  "posts/mcqs",
  "posts/mcqs/questions",
  "posts/mcqs/options",
  "posts/mcqs/solutions",
  "posts/subjects",
  "posts/topics",
  "posts/topics/videos",
  "posts/topics/thumbNails",
  "posts/users",
  "posts/users/male",
  "posts/users/female",
  "posts/socialMedias",
  "posts/socialMedias/imgs",
  "posts/chapters",
];

// function for make all needed global files
const createFoldersMiddleware = () => {
  for (const folder of folderStructure) {
    const folderPath = path.join(__dirname, folder);

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      // If the folder doesn't exist, create it
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }
};
// function for make all needed global files : calls here
createFoldersMiddleware();
// dotEnv Configuration
dotenv.config();

// JSON Configuration
app.use(express.json());

// Cors Configuration
app.use(cors());

// Mongoose Connection
connectToDatabase();
// static folder
app.use(express.static("posts")); // Serve static files from the 'public' directory

// API's routes
app.use("/capsule/api/v1/user", userRouter);
app.use("/capsule/api/v1/admin", adminRouter);
app.use("/capsule/api/v1/subject", subjectRouter);
app.use("/capsule/api/v1/chapter", chapterRouter);
app.use("/capsule/api/v1/topic", topicRouter);
app.use("/capsule/api/v1/mcqs", mcqsRouter);
app.use("/capsule/api/v1/customTest", customTestRouter);
app.use("/capsule/api/v1/book", bookRouter);
app.use("/capsule/api/v1/video", videoRouter);
app.use("/capsule/api/v1/contact", contactRouter);
app.use("/capsule/api/v1/fileSystem", fileSystemRouter);
app.use("/capsule/api/v1/bookmark", bookmarkRouter);
app.use("/capsule/api/v1/report", reportRouter);
app.use("/capsule/api/v1/read", readRouter);
app.use("/capsule/api/v1/mockTest", mockTest);
app.use("/capsule/api/v1/dashboard", dashboard);

app.use((err, req, res, next) => {
  customError(
    err.status || StatusCodes.INTERNAL_SERVER_ERROR,
    res,
    err.message,
    err.stack
  );
});
// Listening to a server
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(
    `Server is running on BaseUrl:  http://localhost:${process.env.PORT}`
  );
});
