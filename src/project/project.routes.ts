import express from "express";
import { authorization, verifyAdmin } from "../service/authorization";
import * as projectController from "./project.controller";

const api = express.Router();

api.post("/new", [authorization, verifyAdmin], projectController.createProject);

api.get('/get-tasks/:projectId', [authorization, verifyAdmin], projectController.getTasksByProject)
api.get("/get", [authorization, verifyAdmin], projectController.getAllProjects);

api.put('/update/:projectId', [authorization, verifyAdmin], projectController.updateProject)

api.delete('/delete/:projectId', [authorization, verifyAdmin], projectController.deleteProject)

export = api;
