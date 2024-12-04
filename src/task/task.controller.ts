import { Request, Response } from "express";
import Project from "../project/project.entity";
import User from "../user/user.entity";
import Task, { TaskData } from "../task/task.entity";
import { validateData } from "../utils/validate";
import createLog from "../log/log.controller";
import { UserToken } from "../service/authorization";

// crear tarea y asignarla al usuario con menos tareas pendientes en el proyecto
export const createTask = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    const task = new Task();

    task.name = req.body.name ?? "";
    task.description = req.body.description ?? "";
    task.projectId = req.body.projectId ?? "";

    const msg = validateData(task);

    if (msg) {
      return res.status(400).send({ message: msg });
    }

    const project = await Project.findOne({ where: { projectId: +task.projectId } });

    if (!project) {
      return res.status(404).send({ message: `Project not found` });
    }

    // rol user por defecto a asignar la tarea 
    let rol = "user";

    // si viene rol
    if (req.body.rol) {
      // si no es admin ni user 
      if ( req.body.rol.toLowerCase() != "admin" && req.body.rol.toLowerCase() != "user" ) {
        return res .status(400).send({ message: "Rol not found. Must be Admin or user" });
      }

      // asignar rol en minusculas
      rol = req.body.rol.toLowerCase();
    }

    const users = await User.find({ where: { rol: rol } });

    if (!users || users.length == 0) {
      return res.status(404).send({ message: `There are no ${rol}s to assign the task` });
    }

    const information = new Array();

    for (const user of users) {
      const tasks = await Task.createQueryBuilder("task")
        .innerJoinAndSelect("task.projectId", "project")
        .innerJoinAndSelect("task.userId", "user")
        .where("project.projectId = :projectId", { projectId: task.projectId })
        .andWhere("user.userId = :userId", { userId: user.userId })
        .andWhere("status = :status", { status: "PENDING" })
        .getMany();

      information.push({ userId: user.userId, counter: tasks.length });
    }

    information.sort((a, b) => a.counter - b.counter);

    task.userId = information[0].userId;
    task.status = "PENDING";

    const newTask = await Task.save(task);

    await createLog(logged.id, "CREATE", "TASK", newTask.taskId);

    return res.status(201).send({
      message: `Task was created successfully and assigned to userId: ${information[0].userId} with pending tasks ${information[0].counter} in project with projectId: ${task.projectId}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error creating task" });
  }
};

// actualizar tarea
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const logged = (req as UserToken).user;

    const task: TaskData = {
      name: req.body.name ?? "",
      description: req.body.description ?? "",
      status: req.body.status ?? "",
      userId: req.body.userId ?? "",
    };

    for (let key of Object.keys(task)) {
      let param = typeof task[key] == "number" ? `${task[key]}` : task[key];
  
      if (param.replace(/[ ]+/g, "") != "") {
        continue;
      }
  
      delete task[key];
    }

    const newTask = new Task();

    if (task.userId) {
      const user = await User.findOne({ where: { userId: +task.userId } });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      newTask.userId = user;
    }

    const statutes = ["PENDING", "IN PROGRESS", "COMPLETE"];

    if (task.status && !statutes.includes(task.status.toUpperCase())) {
      return res.status(404).send({ message: `Status must be: ${statutes.join(", ")}` });
    }

    newTask.name = task.name;
    newTask.description = task.description;

    await Task.update(taskId, newTask);
    await createLog(logged.id, "UPDATE", "TASK", taskId);

    return res.send({ message: `Task was updated successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating task" });
  }
};

// eliminar tarea
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;
    const { taskId } = req.params;

    const task = await Task.findOne({ where: { taskId: +taskId } });

    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    await Task.delete(taskId);
    await createLog(logged.id, "DELETE", "TASK", taskId);

    return res.send({ message: "Task was removed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error removing task" });
  }
};
