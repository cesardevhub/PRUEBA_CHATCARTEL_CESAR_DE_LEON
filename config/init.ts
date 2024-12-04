import mongoConnect from "./mongo";
import mysqlConnect from "./mysql";
import initServer from "./app";

/**
 * Conectar a mongodb. Conectar a mysql. Levantar servidor local
 */
const initialize = async () => {
  try {
    await mongoConnect();
    await mysqlConnect();
    await initServer();
  } catch (err) {
    console.log(err);
  }
};

export default initialize;
