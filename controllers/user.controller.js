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
const User = require("../models/user.model");
/* for hashing */
const CryptoJS = require("crypto-js");
/* verification component */
const { signToken, signRefreshToken } = require("../utils/verifyToken");

// @description       register user
// Access             public only user can do this
const register = async (req, res) => {
  try {
    const { email, password, fullName, state, contact, gender, exam } =
      req.body;
    // Check if any required fields are missing
    if (
      !email ||
      !password ||
      !fullName ||
      !state ||
      !contact ||
      !gender ||
      !exam
    ) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "All fields are required"
      );
    }

    // Check if the email is a valid email address
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(email)) {
      return customError(StatusCodes.BAD_REQUEST, res, "Invalid email address");
    }

    // Check if the password meets certain criteria (e.g., minimum length)
    if (password.length < 8) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "Password must be at least 8 characters long"
      );
    }

    // Check if the user already exists
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return customError(StatusCodes.NOT_FOUND, res, "User is already exist");
    } else {
      // Password encryption (you might want to improve the encryption method)
      let encryptPassword =
        password &&
        CryptoJS.AES.encrypt(password, process.env.CRYPTO_SEC).toString();
      const newUser = await User.create({
        email,
        password: encryptPassword,
        fullName,
        state,
        contact,
        gender,
        exam,
      });

      const savedUser = await newUser.save();

      // Send Verification Email (implement email sending logic here)
      res.status(201).json({ success: true, data: savedUser, error: null });
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

// @description       login user
// Access             public only user can do this
const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Check if user exist or not
    if (!user) {
      // return res
      //   .status(StatusCodes.NOT_FOUND)
      //   .json({ success: false, error: "User not found", data: null });
      return customError(StatusCodes.NOT_FOUND, res, "User not found");
    } else {
      // Decrypt the password which is stored in Encryption form in database
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
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
        const token = signToken(user._id, randomString);
        let userIs = await User.findByIdAndUpdate(user._id);
        userIs.token.push(refreshToken);
        await userIs.save();
        const { password, otpCode, ...others } = user._doc;
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
// @description       logout user
// Access             public only user can do this
const logout = async (req, res) => {
  try {
    const { token } = req.headers;
    const payload = JWT.verify(token, process.env.JWT_SEC);
    const user = await User.findById(payload.id);
    if (!user) {
      return customError(
        StatusCodes.NOT_FOUND,
        res,
        "user is not found with this token in your header"
      );
    }

    const refreshToken = user.token.filter((item) => {
      const token = JWT.verify(item, process.env.JWT_SEC);
      if (token.uniqueId == payload.uniqueId) {
        return true;
      }
    });
    await User.updateOne(
      { _id: user._id },
      { $pull: { token: refreshToken[0] } }
    );
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: "Accepted the user is logout",
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
// @Access            Private (Authenticated) - User having token can edit otherwise cannot edit
const editProfile = async (req, res, next) => {
  try {
    const { fullName, gender, password } = req.body;
    if (password) {
      req.body.password = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SEC
      ).toString();
    }
    const user = await User.findById(req.user.id);

    if (!user) {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "User not found"
      );
    }
    let errorChecker = false;
    if (user.image) {
      // Delete the file
      fs.unlink(`./posts${user.image}`, async (err) => {
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
          Object.assign(user, { fullName, gender, password });

          // Save the updated subject
          await user.save();
          const { token, ...sanitizedUser } = user.toObject(); // 'toObject' converts Mongoose document to a plain JavaScript object
          res
            .status(200)
            .json({ success: true, data: sanitizedUser, error: null });
        }
      });
    } else {
      // Update the subject properties from the request body
      Object.assign(user, req.body);
      user.dateModified = Date.now();
      // Save the updated subject
      await user.save();
      const { token, ...sanitizedUser } = user.toObject(); // 'toObject' converts Mongoose document to a plain JavaScript object
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

// @description       get all users
// @Access            Private only admin can do this
const getAllUsers = async (req, res) => {
  try {
    let allUsers = await User.find();
    allUsers = allUsers.filter((item) => {
      if (item.isAdmin == false) {
        return true;
      } else {
        return false;
      }
    });
    // Remove 'token' property from each object in the array
    const sanitizedUsers = allUsers.map((user) => {
      const { token, ...sanitizedUser } = user.toObject(); // 'toObject' converts Mongoose document to a plain JavaScript object
      return sanitizedUser;
    });
    res.status(200).json({
      success: true,
      data: sanitizedUsers,
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
// @description       get user data
// @Access            Public only user can do this
const getUser = async (req, res) => {
  try {
    let token = req.header("token");
    const payload = JWT.verify(token, process.env.JWT_SEC);

    // Define the fields you want to exclude
    const fieldsToExclude =
      "-token -password -_id  -modelName -dateCreated -__v -status";

    // Find a record and exclude the specified fields
    const user = await User.findById(payload.id)
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
  register,
  login,
  logout,
  editProfile,
  getAllUsers,
  getUser,
};
