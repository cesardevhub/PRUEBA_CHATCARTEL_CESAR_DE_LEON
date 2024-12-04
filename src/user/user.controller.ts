import { NextFunction, Request, Response } from "express";
import User, { UserData } from "./user.entity";
import Task from "../task/task.entity";
import { encrypt, validateData, compare } from "../utils/validate";
import { createToken } from "../service/jwt";
import { UserToken } from "../service/authorization";
import createLog from "../log/log.controller";

export const test = async (req:Request, res: Response) => {
  return res.send({ message: "User test running successfully" });
}

// crear admin por defecto al levantar el servidor
export const adminDefault = async () => {
  try {
    const admin = new User();

    admin.firstname = "Admin";
    admin.lastname = "Default";
    admin.email = "admin";
    admin.password = `${process.env.ADMIN_PASS}`;
    admin.rol = "superadmin";

    const userExists = await User.findOne({ where: { email: admin.email } });

    if (userExists) {
      return console.log("Default admin already exists");
    }

    admin.password = await encrypt(admin.password);
    await User.save(admin);

    console.log("Default admin has been created");
  } catch (err) {
    return console.log("Error creating default admin: ", err);
  }
};

// autenticar usuarios
export const login = async (req: Request, res: Response) => {
  try {
    const login = {
      email: req.body.email ?? "",
      password: req.body.password ?? "",
    };

    const message = validateData(login);

    if (message) {
      return res.status(400).send({ message: message });
    }

    const userExists = await User.findOne({ where: { email: login.email } });

    if (userExists && (await compare(login.password, userExists.password))) {
      const token = await createToken(userExists);

      const user = {
        id: userExists.userId,
        firstname: userExists.firstname,
        lastname: userExists.lastname,
        email: userExists.email,
        rol: userExists.rol,
      };

      return res.send({ user, token: token });
    }

    return res.status(404).send({ message: "Invalid credentials" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error. Not logged" });
  }
};

// crear nueva cuenta de user o admin
export const createAccount = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    const newUser = new User();

    newUser.firstname = req.body.firstname ?? "";
    newUser.lastname = req.body.lastname ?? "";
    newUser.email = req.body.email ?? "";
    newUser.password = req.body.password ?? "";
    newUser.rol = req.body.rol ?? "";

    const message = validateData(newUser);

    if (message) {
      return res.status(400).send({ message: message });
    }

    newUser.rol = newUser.rol.toLowerCase();

    // si el usuario logeado es admin y quiere actualizar el rol 
    if (logged.rol == "admin" && newUser.rol != "user") {
      return res.status(403).send({ message: "Sorry, can't create an admin" });

    // si el nuevo ususario es diferente a admin y user
    } else if (newUser.rol != "admin" && newUser.rol != "user") {
      return res.status(400).send({ message: "Param Rol must be admin or user" });
    }

    const user = await User.findOne({ where: { email: newUser.email } });

    if (user) {
      return res.status(400).send({ message: "Sorry, email already exists" });
    }

    newUser.password = await encrypt(newUser.password);

    const myNewUser = await User.save(newUser);
    await createLog(logged.id, "CREATE", "USER", myNewUser.userId);

    return res.status(201).send({ message: "Account was created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error creating user" });
  }
};

// Obtener la cuenta para getInfoByAccount y getMyInfo
const getAccount = async (userId: number) => {
  return await User.findOne({
    where: { userId: userId },
    select: [
      "userId",
      "firstname",
      "lastname",
      "email",
      "rol",
      "date_created",
      "date_updated",
    ],
  });
};

// obtener información de una cuenta (solo para admins)
export const getInfoByAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await getAccount(+userId);

    if (!user) {
      return res.status(404).send({ message: "Account not found" });
    }

    return res.send({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting info" });
  }
};

// obtener información de la cuenta logeada
export const getMyInfo = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    const user = await getAccount(+logged.id);

    if (!user) {
      return res.status(404).send({ message: "Account not found" });
    }

    return res.send({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting info" });
  }
};

// obtener todos los usuarios
export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await User.find({
      select: [
        "userId",
        "firstname",
        "lastname",
        "email",
        "rol",
        "date_created",
        "date_updated",
      ],
    });
    return res.send({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting accounts" });
  }
};

// obtener información del body para actualizar
const getUserData = (req: Request) => {
  const userData: UserData = {
    firstname: req.body.firstname ?? "",
    lastname: req.body.lastname ?? "",
    email: req.body.email ?? "",
    password: req.body.password ?? "",
    rol: req.body.rol ?? "",
  };

  for (let key of Object.keys(userData)) {
    let param = typeof userData[key] == "number" ? `${userData[key]}` : userData[key];

    if (param.replace(/[ ]+/g, "") != "") {
      continue;
    }

    delete userData[key];
  }

  return userData;
};

// validar si el correo electrónico y encriptar la contraseña del update
const validateEmailUpdate = async (userData: UserData, userId: number) => {
  if (userData.email) {
    const emailUser = await User.findOne({ where: { email: userData.email } });

    if (emailUser && emailUser.userId != userId) {
      return true;
    }
  }

  if (userData.password) {
    userData.password = await encrypt(userData.password);
  }

  await User.update(userId, userData);
  await createLog(userId, "UPDATE", "USER", userId);

  return false;
};

// actualizar información solo para admins
export const updateAccount = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const logged = (req as UserToken).user;
    const { userId } = req.params;

    if (logged.id != userId) {
      const user = await User.findOne({ where: { userId: +userId } });

      if (!user) {
        return res.status(404).send({ message: "Account not found" });
      }

      const userData = getUserData(req);

      // si es admin
      if (logged.rol == "admin") {
        // y quiere actualizar a otro admin
        if (user.rol != "user") {
          return res.status(403).send({ message: "Sorry, can't update an another admin" });
        }

        // o quiere actualizar el rol del user
        if (userData.rol && user.rol != userData.rol.toLowerCase()) {
          return res.status(403).send({ message: "Sorry, can't update the rol" });
        }

        // si es superadmin
      } else if (logged.rol == "superadmin" && userData.rol) {
        userData.rol = userData.rol.toLowerCase();

        // y no ingresa un rol correcto
        if (userData.rol != "user" && userData.rol != "admin") {
          return res.status(403).send({ message: "Rol must be Admin or User" });
        }
      }

      if (await validateEmailUpdate(userData, +userId)) {
        return res.status(400).send({ message: "Sorry, email already exists" });
      }

      return res.send({ message: "Account was updated successfully" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating account" });
  }
};

// actualizar de la cuenta logeada
export const updateMyAccount = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    const user = await User.findOne({ where: { userId: +logged.id } });

    if (!user) {
      return res.status(404).send({ message: "Account not found" });
    }

    const userData = getUserData(req);

    // si el rol ingresado es diferente al rol de la cuenta
    if (userData.rol && userData.rol != user.rol) {
      return res.status(400).send({ message: "Sorry, you can't update your rol" });

    } else if (await validateEmailUpdate(userData, +logged.id)) {
      return res.status(400).send({ message: "Sorry, email already exists" });
    }

    return res.send({ message: "Your account was updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating account" });
  }
};

// reasignar tareas del usuario a eliminar al usuario con menos tareas del mismo proyecto
const assignTask = async ( assignerId: number, userId: number, projectId: number ) => {
  
  const assigner = await User.findOne({ where: { userId: assignerId } });

  if (assigner) {
    await Task.createQueryBuilder("task")
      .update(Task)
      .set({ userId: assigner })
      .where({ projectId: projectId })
      .andWhere({ userId: userId })
      .execute(); 
  }
};

// eliminar una cuenta
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;
    const { userId } = req.params;

    const user = await User.findOne({ where: { userId: +userId } });

    if (!user) {
      return res.status(404).send({ message: "Account not found" });
    }

    // administradores solo pueden eliminar cuenta de usuarios
    if (logged.rol == "admin" && user.rol != "user") {
      return res.status(403).send({ message: "Sorry, can't remove an admin" });
    }

    // superadmin puede eliminar todas, menos la de el
    if (logged.rol == "superadmin" && user.rol == "superadmin") {
      return res.status(400).send({ message: "Sorry, can't remove a superadmin" });
    }

    // validar si tiene tareas
    const tasks = await Task.createQueryBuilder("task")
      .innerJoinAndSelect("task.userId", "user")
      .innerJoinAndSelect("task.projectId", "project")
      .andWhere("user.userId = :userId", { userId: userId })
      .getMany();

    // inificar projectId
    const uniqueProjects = Array.from(
      new Map(tasks.map((task) => [task.projectId.projectId, task.projectId])).values()
    );

    // recorrer proyectos
    for (const project of uniqueProjects) {

      // obtener tareas en estado pendiente de este proyecto
      const tasksByProject = await Task.createQueryBuilder("task")
        .innerJoinAndSelect("task.userId", "user")
        .innerJoinAndSelect("task.projectId", "project")
        .andWhere("project.projectId = :projectId", { projectId: project.projectId })
        .andWhere("status = :status", { status: "PENDING" })
        .getMany();

      // contar cuantas tareas tiene el usuario {userId: cantidad_de_tareas}
      const tasks_user: { [key: number]: number } = {};

      for (const task of tasksByProject) {
        tasks_user[task.userId.userId] = (tasks_user[task.userId.userId] ?? 0) + 1;
      }

      const entries = Object.entries(tasks_user);
      const sortedEntries = entries.sort((a, b) => a[1] - b[1]);

      let assignerId = 0;

      // asignar posición es mayor a 1 y la posición 0 es igual al usuario a eliminar 
      if (sortedEntries.length > 1 && sortedEntries[0][0] == userId) {
        assignerId = +sortedEntries[1][0];

      // obtener admin default para asignarle las tareas si no se encontraron resultadoso o si posición 0 es igual al usuario a eliminar 
      } else if (sortedEntries.length == 0 || sortedEntries[0][0] == userId) {
        const admin = await User.findOne({ where: { email: "admin" } });

        if (!admin) {
          return res.status(404).send({ message: "User has tasks. No other user was found to assign them" });
        }

        assignerId = admin.userId;

      // de lo contrario asignarle la posición 0
      } else {
        assignerId = +sortedEntries[0][0];
      }

      // a este usuario asignarle las tareas de este proyecto
      await assignTask(assignerId, +userId, project.projectId);
    }

    await User.delete(userId);
    await createLog(logged.id, "DELETE", "USER", userId);

    return res.send({ message: "Account was removed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error removing account" });
  }
};

// obtener tareas
const getTasks = async (userId: number) => {
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
      "project.projectId",
      "project.name",
      "project.description",
      "project.date_created",
      "project.date_updated",
    ])
    .where("user.userId = :userId", { userId: userId })
    .getMany();
};

// obtener tareas asignadas del usuario logeado
export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    const tasks = await getTasks(+logged.id);

    if (!tasks || tasks.length == 0) {
      return res.send({ message: `You don't have tasks`, tasks: [] });
    }

    return res.send({
      message: `You have ${tasks.length} tasks`,
      tasks: tasks,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting tasks" });
  }
};

// obtener tareas asignadas de una cuenta
export const getTasksByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ where: { userId: +userId } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const tasks = await getTasks(+userId);

    if (!tasks || tasks.length == 0) {
      return res.send({ message: `There are no tasks for this user` });
    }

    return res.send({
      message: `UserId: ${userId} has ${tasks.length} tasks`,
      tasks: tasks,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting tasks" });
  }
};

// obtener proyectos asignadas del usuario logeado
export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const logged = (req as UserToken).user;

    const tasks = await getTasks(+logged.id);

    if (!tasks || tasks.length == 0) {
      return res.send({ message: `You don't have projects` });
    }

    const uniqueProjects = Array.from(
      new Map(tasks.map((task) => [task.projectId.projectId, task.projectId])).values()
    );

    return res.send({
      message: `You have ${uniqueProjects.length} projects`,
      projects: uniqueProjects,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting projects" });
  }
};

// obtener proyectos asignadas de una cuenta
export const getProjectsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ where: { userId: +userId } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const tasks = await getTasks(+userId);

    if (!tasks || tasks.length == 0) {
      return res.send({ message: `There are no projects for this user` });
    }

    const uniqueProjects = Array.from(
      new Map(tasks.map((task) => [task.projectId.projectId, task.projectId])).values()
    );

    return res.send({
      message: `UserId: ${userId} has ${uniqueProjects.length} projects`,
      projects: uniqueProjects,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting projects" });
  }
};
