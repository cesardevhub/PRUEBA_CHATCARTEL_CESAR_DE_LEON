import 'reflect-metadata'
import dotenv from "dotenv";
import initialize from "./config/init";

// cargar variables de entorno
dotenv.config();

// inicializar proyecto
initialize();
