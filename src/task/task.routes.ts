import express from "express";
import * as taskController from './task.controller';
import { authorization, verifyAdmin } from "../service/authorization";

const api = express.Router();

api.post('/create', [authorization, verifyAdmin], taskController.createTask);

api.put('/update/:taskId', [authorization, verifyAdmin], taskController.updateTask);

api.delete("/delete/:taskId", [authorization, verifyAdmin], taskController.deleteTask);

export = api;
