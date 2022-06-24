const fs = require("fs");
const bcrypt=require("bcrypt");

const {
  DB_PATH,
  isValid,
  isValidString,
  isValidObject,
  isValidEmail,
} = require("../utils");
const UserModel = require("../models/users.model");

const getAllUsers = async (req, res) => {
  const response = {
    success: true,
    code: 200,
    message: "Users list",
    error: null,
    data: null,
    resource: req.originalUrl,
  };
  try {
    const users = await UserModel.find({});
    response.data = { users };
    return res.status(200).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  const response = {
    success: true,
    code: 200,
    message: "User details",
    error: null,
    data: null,
    resource: req.originalUrl,
  };
  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) throw new Error("User does not exist");
    response.data = { user };
    return res.status(200).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};

const createUser = async (req, res) => {
  const user = req.body;
  const response = {
    success: true,
    code: 201,
    message: "user created successfully",
    data: null,
    error: null,
    resource: req.originalUrl,
  };
  if (!isValid(user) && !isValidObject(user)) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data";
    response.error = "Invalid request data";
    return res.status(400).json(response);
  }
  if (
    !isValid(user.name) ||
    (isValid(user.name) && !isValidString(user.name))
  ) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data. Name is required";
    response.error = "Invalid request data. Name is required";
    return res.status(400).json(response);
  }
  if (
    !isValid(user.email) ||
    (isValid(user.email) && !isValidEmail(user.email))
  ) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data. Email is required";
    response.error = "Invalid request data. Email is required";
    return res.status(400).json(response);
  }
  if (
    !isValid(user.password) ||
    (isValid(user.password) && !isValidString(user.password))
  ) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data. Email is required";
    response.error = "Invalid request data. Email is required";
    return res.status(400).json(response);
  }


try {
    const isEmailExist = await UserModel.findOne({
      email: user.email,
    });
    if (isEmailExist)
      throw new Error(`This email ${user.email} id is already registered.`);
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
      error: error,
      data: null,
      resource: req.originalUrl,
    });
  }
      const SALT=bcrypt.genSaltSync(10);
    const hashedPassward=await bcrypt.hash(user.password.trim(),SALT);
  const cleanedUserData = {
    name: user.name.trim(),
    email: user.email.trim(),
    password:hashedPassward,
  };
  try {
    const newUser = new UserModel(cleanedUserData);
    await newUser.save();
    response.data = { user: newUser };
    return res.status(201).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};


const updateUser = async (req, res) => {
  const { userId } = req.params;
  const userData = req.body;
  if (!isValid(userData) || !isValidObject(userData)) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Empty request body, nothing to update.",
      error: null,
      data: null,
      resource: req.originalUrl,
    });
  }

  if (isValid(userData.email) && isValidEmail(userData.email)) {
    try {
      const isEmailExist = await UserModel.findOne({
        email: userData.email,
        _id: { $ne: userId },
      });
      if (isEmailExist)
        throw new Error(
          `This email ${userData.email} id is already registered.`
        );
    } catch (error) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: error.message,
        error: error,
        data: null,
        resource: req.originalUrl,
      });
    }
  }
  try {
    const isUserExist = await UserModel.findById(userId);
    if (!isUserExist)
      throw new Error("Invalid user id. User does not exist with this id.");

    if(userData.password) {
      const saltRounds = 16;
      const salt = await bcrypt.genSalt(saltRounds);
      const SALT=bcrypt.genSaltSync(10);
      userData.password = await bcrypt.hash(userData.password, SALT);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: userData },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      code: 200,
      message: "User updated successfully",
      error: null,
      data: { user: updatedUser },
      resource: req.originalUrl,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: error.message,
      error: error,
      data: null,
      resource: req.originalUrl,
    });
  }
};


const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const isUserExist = await UserModel.findById(userId);
    if (!isUserExist)
      throw new Error("Invalid user id. User does not exist with this id.");
    isUserExist.delete();
    return res.status(200).json({
      success: true,
      code: 200,
      message: "User deleted successfully",
      error: null,
      data: { user: isUserExist },
      resource: req.originalUrl,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: error.message,
      error: error,
      data: null,
      resource: req.originalUrl,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};