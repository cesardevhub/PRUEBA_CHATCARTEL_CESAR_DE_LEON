import { Request, Response } from "express";
import Project, { ProjectData } from "./project.entity";
import Task from "../task/task.entity";
import { validateData } from "../utils/validate";
import createLog from "../log/log.controller";
import { UserToken } from "../service/authorization";

// crear nuevo proyecto (solo para admins)
export const createProject = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    let project = new Project();

    project.name = req.body.name ?? "";
    project.description = req.body.description ?? "";

    const msg = validateData(project);

    if (msg) {
      return res.status(400).send({ message: msg });
    }

    const newProject = await Project.save(project);
    await createLog(logged.id, "CREATE", "PROJECT", newProject.projectId);

    return res.status(201).send({ message: `Project was created successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error creating project" });
  }
};

// obtener todos los proyectos
export const getAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find();

    if (projects && projects.length == 0) {
      return res.send({ message: "There are no projects" });
    }

    return res.send({
      message: `There are ${projects.length} projects`,
      projects: projects,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting projects" });
  }
};

const getProject = async (project: number) => {
  return await Task.createQueryBuilder("task")
    .innerJoinAndSelect("task.projectId", "project")
    .innerJoinAndSelect("task.userId", "user")
    .select([
      "task.taskId",
      "task.name",
      "task.description",
      "task.status",
      "task.date_created",
      "task.date_updated",
      "user.userId",
      "user.firstname",
      "user.lastname",
      "user.email",
      "user.rol",
    ])
    .andWhere("project.projectId = :projectId", {
      projectId: project,
    })
    .getMany();
};

// obtener tareas de un proyecto
export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ where: { projectId: +projectId } });

    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    const tasks = await getProject(project.projectId);

    return res.send({ tasks });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting projects" });
  }
};

// actualizar información de un proyecto
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const logged = (req as UserToken).user;

    const project = await Project.findOne({ where: { projectId: +projectId } });

    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    const projectData: ProjectData = {
      name: req.body.name ?? "",
      description: req.body.description ?? "",
    };

    for (let key of Object.keys(projectData)) {
      let param = typeof projectData[key] == "number" ? `${projectData[key]}` : projectData[key];

      if (param.replace(/[ ]+/g, "") != "") {
        continue;
      }

      delete projectData[key];
    }

    await Project.update(projectId, projectData);
    await createLog(logged.id, "UPDATE", "PROJECT", projectId);

    return res.send({ message: `Project was updated successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating project" });
  }
};

// eliminar un proyecto con sus tareas
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const logged = (req as UserToken).user;

    const project = await Project.findOne({ where: { projectId: +projectId } });

    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    const tasks = await Task.createQueryBuilder("task")
      .innerJoinAndSelect("task.projectId", "project")
      .where("project.projectId = :projectId", { projectId: projectId })
      .getMany();

    for (const task of tasks) {
      await Task.delete(task.taskId);
    }

    await Project.delete(projectId);
    await createLog(logged.id, "DELETE", "PROJECT", projectId);

    return res.send({ message: `Project was removed successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error removing project" });
  }
};
