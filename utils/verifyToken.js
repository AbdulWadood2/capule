/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const JWT = require("jsonwebtoken");
/* error */
const { customError } = require("../errors/custom.error");
/* models */
const User = require("../models/user.model");
const Admin = require("../models/admin.model");

const signRefreshToken = (uniqueId) => {
  return JWT.sign({ uniqueId }, process.env.JWT_SEC);
};

const signToken = (id, uniqueId) => {
  return JWT.sign({ id, uniqueId }, process.env.JWT_SEC, {
    expiresIn: process.env.expirydateJwt,
  });
};

// Just simply verify the token, user has a token or not, valid or not valid
const verifyToken = async (req, res, next) => {
  try {
    req.body.res = res;
    let token = req.header("token");
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let user = await User.findById(payload.id);
    if (!user) {
      return customError(StatusCodes.UNAUTHORIZED, res, "Access Denied!");
    }
    // const payloadunique = [];
    // for (let item of user.token) {
    //   const token = JWT.verify(item, process.env.JWT_SEC);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return customError(StatusCodes.UNAUTHORIZED, res, "Invalid Token");
    // }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      const user = await User.findById(verified.id);
      req.user = user;
      next();
    } catch (error) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "Invalid Token",
        error.stack
      );
    }
  } catch (error) {
    return customError(
      StatusCodes.UNAUTHORIZED,
      res,
      error.message,
      error.stack
    );
  }
};
// user and admin both user this middleware
const verifyAll = async (req, res, next) => {
  try {
    req.body.res = res;
    let token = req.header("token");
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let user = await User.findById(payload.id);
    let admin = await Admin.findById(payload.id);
    user = user ? user : admin;
    if (!user) {
      return customError(StatusCodes.UNAUTHORIZED, res, "Access Denied!");
    }
    // const payloadunique = [];
    // for (let item of user.token) {
    //   const token = JWT.verify(item, process.env.JWT_SEC);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return customError(StatusCodes.UNAUTHORIZED, res, "Invalid Token");
    // }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      if (verified) {
        req.user = user;
      }
      next();
    } catch (error) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "Invalid Token",
        error.stack
      );
    }
  } catch (error) {
    return customError(
      StatusCodes.UNAUTHORIZED,
      res,
      error.message,
      error.stack
    );
  }
};

// Verify the token and verify the user as well that the logged in user is authenticated or not
const verifyTokenAndAuthorization = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.userId) {
      next();
    } else {
      return customError(
        StatusCodes.FORBIDDEN,
        res,
        "You are not allowed to perform this action."
      );
    }
  });
};

// Verify token and admin

const verifyTokenAndAdmin = async (req, res, next) => {
  try {
    req.body.res = res;
    let token = req.header("token");
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let admin = await Admin.findById(payload.id);
    let user = admin;
    if (!user) {
      return customError(StatusCodes.UNAUTHORIZED, res, "Access Denied!");
    }
    // const payloadunique = [];
    // for (let item of user.token) {
    //   const token = JWT.verify(item, process.env.JWT_SEC);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return customError(StatusCodes.UNAUTHORIZED, res, "Invalid Token");
    // }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      req.user = verified;
      next();
    } catch (error) {
      return customError(
        StatusCodes.UNAUTHORIZED,
        res,
        "Invalid Token",
        error.stack
      );
    }
  } catch (error) {
    return customError(
      StatusCodes.UNAUTHORIZED,
      res,
      error.message,
      error.stack
    );
  }
};

/* refreshToken */
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.headers.token;

    // Retrieve the user from the database based on the refresh token
    let user = await User.findOne({ token: refreshToken });
    let admin = await Admin.findOne({ token: refreshToken });
    user = user ? user : admin;

    if (!user) {
      throw new Error("User not found or invalid refresh token.");
    }
    const payload = JWT.verify(refreshToken, process.env.JWT_SEC);
    // Issue a new access token
    const newAccessToken = signToken(user.id, payload.uniqueId);

    res.json({ token: newAccessToken });
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
  verifyTokenAndAuthorization,
  verifyToken,
  verifyAll,
  verifyTokenAndAdmin,
  signToken,
  signRefreshToken,
  refreshToken,
};
