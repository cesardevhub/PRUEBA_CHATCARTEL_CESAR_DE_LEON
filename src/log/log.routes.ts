import express from "express";
import { authorization, verifyAdmin } from "../service/authorization";
import { getLogs } from "./log.controller";

const api = express.Router();

api.get("/get", [authorization, verifyAdmin], getLogs);

export = api;
