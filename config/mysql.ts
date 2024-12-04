// dependencia para mysql
import { DataSource, DataSourceOptions } from "typeorm";

// entidades de la base de datos
import User from "../src/user/user.entity";
import Project from "../src/project/project.entity";
import Task from "../src/task/task.entity";

/**
 * Establecer conexión a la base de datos en mysql
 */
const mysqlConnect = async () => {
  const port = +(process.env.DB_PORT || 3306);

  const dataSourceOptions: DataSourceOptions = {
    type: "mysql",
    host: `${process.env.DB_HOST}`,
    port: port,
    username: `${process.env.DB_USER}`,
    password: `${process.env.DB_PASS}`,
    database: `${process.env.DB_NAME}`,
    entities: [User, Project, Task],
    synchronize: false,
  };

  const AppDataSource = new DataSource(dataSourceOptions);
  await AppDataSource.initialize();
  console.log("Conected to mysql");
};

export default mysqlConnect;
