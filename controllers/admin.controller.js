/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* jwt */
const JWT = require("jsonwebtoken");
/* custom error */
const { customError } = require("../errors/custom.error");
/* file System */
const fs = require("fs");
/* models */
const Admin = require("../models/admin.model");
/* for hashing */
const CryptoJS = require("crypto-js");
/* verification component */
const { signToken, signRefreshToken } = require("../utils/verifyToken");
// @description       login admin
// Access             PRIVATE only admin can do it
const login = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    // Check if user exist or not
    if (!admin) {
      // return res
      //   .status(StatusCodes.NOT_FOUND)
      //   .json({ success: false, error: "admin not found", data: null });
      return customError(StatusCodes.NOT_FOUND, res, "admin not found");
    } else {
      // Decrypt the password which is stored in Encryption form in database
      const hashedPassword = CryptoJS.AES.decrypt(
        admin.password,
        process.env.CRYPTO_SEC
      );
      const realPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
      if (realPassword !== req.body.password) {
        return customError(
          StatusCodes.BAD_REQUEST,
          res,
          "password is incorrect"
        );
      } else {
        function generateRandomString(length) {
          const characters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let randomString = "";

          for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
          }

          return randomString;
        }
        const randomString = generateRandomString(40);
        // Create refresh Token
        const refreshToken = signRefreshToken(randomString);
        // ectually it is access token
        const token = signToken(admin._id, randomString);
        let adminIs = await Admin.findByIdAndUpdate(admin._id);
        adminIs.token.push(refreshToken);
        await adminIs.save();
        const { password, otpCode, ...others } = admin._doc;
        res.header("token", token).json({
          success: true,
          data: { ...others, token, refreshToken },
          error: null,
        });
      }
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
// @description       logout admin
// Access             PRIVATE only admin can do it
const logout = async (req, res) => {
  try {
    const { token } = req.headers;
    const payload = JWT.verify(token, process.env.JWT_SEC);
    const admin = await Admin.findById(payload.id);
    if (!admin) {
      return customError(
        StatusCodes.NOT_FOUND,
        res,
        "admin is not found with this token in your header"
      );
    }

    const refreshToken = admin.token.filter((item) => {
      const token = JWT.verify(item, process.env.JWT_SEC);
      if (token.uniqueId == payload.uniqueId) {
        return true;
      }
    });
    await Admin.updateOne(
      { _id: admin._id },
      { $pull: { token: refreshToken[0] } }
    );
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: "Accepted the admin is logout",
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

// @description       Edit Profile
// @Access            PRIVATE only admin can do it
const editProfile = async (req, res, next) => {
  try {
    const jwt = req.header("token");
    const { fullName, gender, password } = req.body;
    if (password) {
      req.body.password = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SEC
      ).toString();
    }
    const admin = await Admin.findOne({ token: jwt });

    if (!admin) {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "admin not found"
      );
    }
    let errorChecker = false;
    if (admin.image) {
      // Delete the file
      fs.unlink(`./posts${admin.image}`, async (err) => {
        if (err) {
          errorChecker = true;
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            err,
            error: "error deleting the file",
            data: null,
          });
        } else {
          // Update the subject properties from the request body
          Object.assign(admin, req.body);

          // Save the updated subject
          await admin.save();
          const { token, ...sanitizedUser } = user.toObject(); // 'toObject' converts Mongoose document to a plain JavaScript object
          res
            .status(200)
            .json({ success: true, data: sanitizedUser, error: null });
        }
      });
    } else {
      // Update the subject properties from the request body
      Object.assign(admin, { fullName, gender, password });

      // Save the updated subject
      await admin.save();
      const { token, ...sanitizedUser } = admin.toObject(); // 'toObject' converts Mongoose document to a plain JavaScript object
      res.status(200).json({ success: true, data: sanitizedUser, error: null });
    }

    if (!errorChecker) {
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
// @description       get admin data
// Access             PRIVATE only admin can do it
const getAdmin = async (req, res) => {
  try {
    let token = req.header("token");
    const payload = JWT.verify(token, process.env.JWT_SEC);

    // Define the fields you want to exclude
    const fieldsToExclude =
      "-token -password -_id  -modelName -dateCreated -__v -status";

    // Find a record and exclude the specified fields
    const admin = await Admin.findById(payload.id)
      .select(fieldsToExclude)
      .then((result) => {
        // The 'result' will contain the document with the specified fields excluded
        if (result) {
          return res.status(StatusCodes.ACCEPTED).json({
            success: true,
            error: null,
            data: result,
          });
        } else {
          return customError(
            StatusCodes.NOT_FOUND,
            res,
            "admin not exist with this token"
          );
        }
      })
      .catch((err) => {
        // Handle any errors that occur during the query
        console.error(err);
        return customError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          res,
          "An error occurred"
        );
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
  login,
  logout,
  editProfile,
  getAdmin,
};
