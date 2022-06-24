const express = require("express");

const { todosController } = require("../../controllers");

const router = express.Router();

router.get("/", todosController.getAllTodos);
router.post("/", todosController.createtodo);
 router.put("/:todoId", todosController.updatetodo);
 router.delete("/:todoId", todosController.deletetodo);
module.exports = router;