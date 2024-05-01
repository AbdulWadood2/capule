/* file system */
const fs = require("fs");
/* multer for upload file in server */
const multer = require("multer");
/* models */
const User = require("./models/user.model");
const Subject = require("./models/subject.model");
const Book = require("./models/book.model");
const Topic = require("./models/topic.model");

/* new code */
const { getExtensionOfFile } = require("./functions/utility.functions");
const multerStorageUser = multer.diskStorage({
  destination: async (req, file, cb) => {
    let { type, fileLocation } = req.query;
    if (!fileLocation) {
      return cb(new Error(`fileLocation is required`));
    }
    let fileType = fileLocation;
    let fileSplit = getExtensionOfFile(file.originalname);
    /* this is all videos that are possible */
    const videoExtensions = [
      "mp4",
      "mkv",
      "avi",
      "mov",
      "wmv",
      "flv",
      "webm",
      "mpeg",
      "mpg",
      "3gp",
    ];
    if (fileType == "books") {
      if (
        fileSplit.toLowerCase() === "jpg" ||
        fileSplit.toLowerCase() === "jpeg" ||
        fileSplit.toLowerCase() === "png" ||
        fileSplit.toLowerCase() === "gif" ||
        fileSplit.toLowerCase() === "bmp" ||
        fileSplit.toLowerCase() === "tiff"
      ) {
        cb(null, `./posts/${fileLocation}/imgs`);
      } else if (fileSplit.toLowerCase().endsWith("pdf")) {
        cb(null, `./posts/${fileLocation}/pdfs`);
      }
    } else if (fileType == "subjects") {
      if (
        fileSplit.toLowerCase() === "jpg" ||
        fileSplit.toLowerCase() === "jpeg" ||
        fileSplit.toLowerCase() === "png" ||
        fileSplit.toLowerCase() === "gif" ||
        fileSplit.toLowerCase() === "bmp" ||
        fileSplit.toLowerCase() === "tiff"
      ) {
        cb(null, `./posts/${fileLocation}`);
      }
    } else if (fileType == "topics") {
      if (
        videoExtensions.some((ext) => fileSplit.toLowerCase().endsWith(ext))
      ) {
        cb(null, `./posts/${fileLocation}/videos`);
      }
      if (
        fileSplit.toLowerCase() === "jpg" ||
        fileSplit.toLowerCase() === "jpeg" ||
        fileSplit.toLowerCase() === "png" ||
        fileSplit.toLowerCase() === "gif" ||
        fileSplit.toLowerCase() === "bmp" ||
        fileSplit.toLowerCase() === "tiff"
      ) {
        cb(null, `./posts/${fileLocation}/thumbNails`);
      }
    } else if (fileType == "mcqs") {
      if (
        fileSplit.toLowerCase() === "jpg" ||
        fileSplit.toLowerCase() === "jpeg" ||
        fileSplit.toLowerCase() === "png" ||
        fileSplit.toLowerCase() === "gif" ||
        fileSplit.toLowerCase() === "bmp" ||
        fileSplit.toLowerCase() === "tiff"
      ) {
        if (!type) {
          return cb(new Error(`type is required`));
        }
        if (type == "options") {
          cb(null, `./posts/${fileLocation}/options`);
        } else if (type == "questions") {
          cb(null, `./posts/${fileLocation}/questions`);
        } else if (type == "solutions") {
          cb(null, `./posts/${fileLocation}/solutions`);
        } else {
          return cb(
            new Error(`valid file names are options question solutions`)
          );
        }
      }
    } else if (fileType == "socialMedias") {
      if (
        fileSplit.toLowerCase() === "jpg" ||
        fileSplit.toLowerCase() === "jpeg" ||
        fileSplit.toLowerCase() === "png" ||
        fileSplit.toLowerCase() === "gif" ||
        fileSplit.toLowerCase() === "bmp" ||
        fileSplit.toLowerCase() === "tiff"
      ) {
        cb(null, `./posts/${fileLocation}/imgs`);
      }
    } else if (fileType == "chapters") {
      if (
        fileSplit.toLowerCase() === "jpg" ||
        fileSplit.toLowerCase() === "jpeg" ||
        fileSplit.toLowerCase() === "png" ||
        fileSplit.toLowerCase() === "gif" ||
        fileSplit.toLowerCase() === "bmp" ||
        fileSplit.toLowerCase() === "tiff"
      ) {
        cb(null, `./posts/${fileLocation}`);
      }
    } else {
      return cb(
        new Error(
          `valid fileLocations are subjects books topics mcqs socialMedias chapters`
        )
      );
    }

    // if (fileType == "users") {
    //   if (
    //     fileSplit.toLowerCase() === "jpg" ||
    //     fileSplit.toLowerCase() === "jpeg" ||
    //     fileSplit.toLowerCase() === "png" ||
    //     fileSplit.toLowerCase() === "gif" ||
    //     fileSplit.toLowerCase() === "bmp" ||
    //     fileSplit.toLowerCase() === "tiff"
    //   ) {
    //     const folderPath = `${fileLocation}/${req.user.id}`;
    //     // Create the folder if it doesn't exist
    //     if (!folderExists(folderPath)) {
    //       fs.mkdir(folderPath, (err) => {
    //         if (err) {
    //           if (err.code === "EEXIST") {
    //             console.log(`The folder "${folderPath}" already exists.`);
    //             cb(null, folderPath); // Continue with the operation, folder exists
    //           } else {
    //             console.error(
    //               `Error creating the folder "${folderPath}": ${err}`
    //             );
    //             const customError = new Error("Error creating folder");
    //             customError.status = 500; // Internal Server Error
    //             cb(customError); // Pass the error to the callback
    //           }
    //         } else {
    //           console.log(`The folder "${folderPath}" has been created.`);
    //           cb(null, folderPath); // Continue with the operation, folder created
    //         }
    //       });
    //     }
    //   }
    // }
  },
  filename: (req, file, cb) => {
    try {
      const { fileLocation, type } = req.query;
      if (!fileLocation) {
        return cb(new Error(`fileLocation is required`));
      }
      let fileType = fileLocation;

      let fileExtension = getExtensionOfFile(file.originalname);
      /* this is all videos that are possible */
      const videoExtensions = [
        "mp4",
        "mkv",
        "avi",
        "mov",
        "wmv",
        "flv",
        "webm",
        "mpeg",
        "mpg",
        "3gp",
      ];
      let filename;
      if (fileType === "subjects") {
        if (
          fileExtension.toLowerCase() === "jpg" ||
          fileExtension.toLowerCase() === "jpeg" ||
          fileExtension.toLowerCase() === "png" ||
          fileExtension.toLowerCase() === "gif" ||
          fileExtension.toLowerCase() === "bmp" ||
          fileExtension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.file = `/${fileType}/${filename}`;
        }
      } else if (fileType === "books") {
        if (fileExtension.toLowerCase().endsWith("pdf")) {
          filename = `${Date.now()}.pdf`;
          req.file = `/${fileType}/pdfs/${filename}`;
        } else if (
          fileExtension.toLowerCase() === "jpg" ||
          fileExtension.toLowerCase() === "jpeg" ||
          fileExtension.toLowerCase() === "png" ||
          fileExtension.toLowerCase() === "gif" ||
          fileExtension.toLowerCase() === "bmp" ||
          fileExtension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.file = `/${fileType}/imgs/${filename}`;
        }
      } else if (fileType === "topics") {
        if (
          videoExtensions.some((ext) =>
            fileExtension.toLowerCase().endsWith(ext)
          )
        ) {
          filename = `${Date.now()}.mp4`;
          req.file = `/${fileType}/videos/${filename}`;
        }
        if (
          fileExtension.toLowerCase() === "jpg" ||
          fileExtension.toLowerCase() === "jpeg" ||
          fileExtension.toLowerCase() === "png" ||
          fileExtension.toLowerCase() === "gif" ||
          fileExtension.toLowerCase() === "bmp" ||
          fileExtension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.file = `/${fileType}/thumbNails/${filename}`;
        }
      } else if (fileType === "mcqs") {
        if (
          fileExtension.toLowerCase() === "jpg" ||
          fileExtension.toLowerCase() === "jpeg" ||
          fileExtension.toLowerCase() === "png" ||
          fileExtension.toLowerCase() === "gif" ||
          fileExtension.toLowerCase() === "bmp" ||
          fileExtension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.file = `/${fileType}/${type}/${filename}`;
        }
      } else if (fileType == "socialMedias") {
        if (
          fileExtension.toLowerCase() === "jpg" ||
          fileExtension.toLowerCase() === "jpeg" ||
          fileExtension.toLowerCase() === "png" ||
          fileExtension.toLowerCase() === "gif" ||
          fileExtension.toLowerCase() === "bmp" ||
          fileExtension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.file = `/${fileType}/imgs/${filename}`;
        }
      } else if (fileType == "chapters") {
        if (
          fileExtension.toLowerCase() === "jpg" ||
          fileExtension.toLowerCase() === "jpeg" ||
          fileExtension.toLowerCase() === "png" ||
          fileExtension.toLowerCase() === "gif" ||
          fileExtension.toLowerCase() === "bmp" ||
          fileExtension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.file = `/${fileType}/${filename}`;
        }
      } else {
        return cb(
          new Error(
            `valid fileLocations are [subjects, books, topics, mcqs, socialMedias, chapters]`
          )
        );
      }
      // if (fileType === "users") {
      //   if (
      //     fileExtension.toLowerCase() === "jpg" ||
      //     fileExtension.toLowerCase() === "jpeg" ||
      //     fileExtension.toLowerCase() === "png" ||
      //     fileExtension.toLowerCase() === "gif" ||
      //     fileExtension.toLowerCase() === "bmp" ||
      //     fileExtension.toLowerCase() === "tiff"
      //   ) {
      //     filename = `${Date.now()}.jpg`;
      //     req.img = `/${fileType}/${req.user.id}/${filename}`;
      //   }
      // }

      cb(null, filename);
    } catch (err) {
      console.error(err);
      cb(err);
    }
  },
});
const uploadsUser = multer({
  storage: multerStorageUser,
});
module.exports = uploadsUser.fields([
  { name: "photo", maxCount: 100 },
  { name: "file", maxCount: 100 },
  { name: "video", maxCount: 100 },
]);
