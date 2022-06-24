const fs = require("fs");

const { DB_PATH } = require("../utils");
const todoModel = require("../models/todos.model");

const getAllTodos = async (req, res) => {
    const response = {
      success: true,
      code: 200,
      message: "todos list",
      error: null,
      data: null,
      resource: req.originalUrl,
    };
    try {
      const todos = await todoModel.find({});
      response.data = { todos };
      return res.status(200).json(response);
    } catch (error) {
      response.error = error;
      response.message = error.message;
      response.code = error.code ? error.code : 500;
      return res.status(500).json(response);
    }
  };
  
const createtodo=async (req,res)=>{
  // res.send("welcome to post")
    const todos = req.body;
    console.log(todos)
    const response = {
      success: true,
      code: 201,
      message: "todos created successfully",
      data: null,
      error: null,
      resource: req.originalUrl,
    };
    if (!todos) {
      response.success = false;
      response.code = 400;
      response.message = "Invalid request data";
      response.error = "Invalid request data";
      return res.status(400).json(response);
    }
    
    const cleanedtodoData = {
      todo: todos.todo.trim(),
      isCompleted: todos.isCompleted,
      isDeleted: todos.isDeleted,
      createdAt: todos.createdAt,
      modifiedAt: todos.modifiedAt,
      deletedAt: todos.deletedAt,
    };
  
   
    try {
      const newtodo = new todoModel(cleanedtodoData);
      await newtodo.save();
      response.data = { todos: newtodo };
      // newtodo.isCompleted=true;
      return res.status(201).json(response);
    } catch (error) {
      response.error = error;
      response.message = error.message;
      response.code = error.code ? error.code : 500;
      return res.status(500).json(response);
    }
}

const updatetodo= async (req,res)=>{
const {todoId}=req.params;
  const todoData=req.body;
const response={
  success: true,
  code: 201,
  message: "todos created successfully",
  data: null,
  error: null,
  resource: req.originalUrl,
}

const updatedtodoData = {
  todo: todoData.todo.trim(),
  isCompleted: todoData.isCompleted,
  isDeleted: todoData.isDeleted,
  createdAt: todoData.createdAt,
  modifiedAt: todoData.modifiedAt,
  deletedAt: todoData.deletedAt,
};
try {
  const isTodoExist = await todoModel.findById(todoId);
  if (!isTodoExist)
    throw new Error("Invalid todo id. todo does not exist with this id.");

  const updatedtodo = await todoModel.findByIdAndUpdate(
    todoId,
    { $set: todoData },
    { new: true }
  );
  return res.status(200).json({
    success: true,
    code: 200,
    message: "todo updated successfully",
    error: null,
    data: { todo: updatedtodo },
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

const deletetodo = async (req, res) => {
  const { todoId } = req.params;
  const newdate=new Date;
  const response = {
    success: true,
    code: 200,
    message: "todos deleted",
    error: null,
    data: null,
    resource: req.originalUrl,
  };
  try {
    const istodoExist = await todoModel.findOneAndDelete({_id:todoId});
    if (!istodoExist)
      throw new Error("Invalid todo id. todo does not exist with this id.");
      response.data={todos:istodoExist}
      istodoExist.deletedAt=new Date;
      return res.status(200).json(response);
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
  getAllTodos,
  createtodo,
updatetodo,
deletetodo,
};