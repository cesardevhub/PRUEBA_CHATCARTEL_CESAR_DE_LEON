// dependencia para mongodb
import mongoose from "mongoose";

/**
 * Establecer conexión a la base de datos en mongodb
 */
const mongoConnect = async () => {
  const uriMongo = `${process.env.URI_MONGO}`;
  mongoose.set("strictQuery", false);
  await mongoose.connect(uriMongo);
  console.log("Conected to mongodb");
};

export default mongoConnect;
