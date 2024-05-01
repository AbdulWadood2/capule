const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

const { customError } = require("../errors/custom.error");
// @description       POST files
// @Access            Private only admin can do this
const uploadFiles = async (req, res, next) => {
  if (!req.files?.photo && !req.files?.file && !req.files?.video) {
    return customError(
      StatusCodes.BAD_REQUEST,
      res,
      "plz provide img , videos or file"
    );
  }
  let result = {};
  if (req.files.photo) {
    req.files.photo = req.files.photo.map((item) => {
      return `/img/users/${item.filename}`;
    });
    result.photos = req.files.photo;
  }
  if (req.files.video) {
    req.files.video = req.files.video.map((item) => {
      return `/img/users/${item.filename}`;
    });
    result.videos = req.files.video;
  }
  if (req.files.file) {
    req.files.file = req.files.file.map((item) => {
      return `/img/users/${item.filename}`;
    });
    result.files = req.files.file;
  }
  res.status(200).json({
    success: true,
    file: req.file,
    // data: result,
  });
};

module.exports = {
  uploadFiles,
};
