import express from 'express'
import { authorization, verifyAdmin } from '../service/authorization';
import * as userController from './user.controller';

const api = express.Router();

api.get("/test", userController.test);

api.post("/auth/login", userController.login);

api.post("/new-account", [authorization, verifyAdmin], userController.createAccount);

api.get('/get-info/:userId', [authorization, verifyAdmin], userController.getInfoByAccount);
api.get('/get-info', authorization, userController.getMyInfo);
api.get('/get', [authorization, verifyAdmin], userController.getAll);

api.get("/get-tasks/:userId", [authorization, verifyAdmin], userController.getTasksByUser);
api.get('/get-tasks', authorization, userController.getMyTasks);

api.get("/get-projects/:userId", [authorization, verifyAdmin], userController.getProjectsByUser);
api.get('/get-projects', authorization, userController.getMyProjects);

api.put("/update/:userId", [authorization, verifyAdmin, userController.updateAccount], userController.updateMyAccount);
api.put("/update", authorization, userController.updateMyAccount);

api.delete("/delete/:userId", [authorization, verifyAdmin], userController.deleteUser);

export = api;