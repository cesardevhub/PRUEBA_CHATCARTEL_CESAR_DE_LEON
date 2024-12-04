// dependencias para el servidor local
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

// función para crear admin por defecto
import { adminDefault } from "../src/user/user.controller";

// archivos de endpoints
import userRoutes from "../src/user/user.routes";
import projectRoutes from "../src/project/project.routes";
import taskRoutes from "../src/task/task.routes";
import logRoutes from "../src/log/log.routes";

// utilizar función de express
const app = express();

// configuración para el manejo de datos entrantes
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// configuración segura para el servidor
app.use(cors());
app.use(helmet());

// configuración para ambiente de desarrollo
app.use(morgan("dev"));

// establecer apis sus endpoints
app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/task", taskRoutes);
app.use("/log", logRoutes);

/**
 * Iniciar servidor express asignandole un puerto y creando un admin por defecto
 */
const initServer = async () => {
  app.listen(process.env.PORT);
  console.log(`HTTP server running on port ${process.env.PORT}`);
  adminDefault();
};

export default initServer;
