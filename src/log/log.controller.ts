import Log from "./log.model";
import { Request, Response } from "express";

/**
 * Crear log de la actividad realizada
 * @param userId
 * @param action CREATE/UPDATE/DELETE
 * @param rsrc USER/PROJECT/TASK
 * @param rsrcId
 */
const createLog = async ( userId: string | number, action: string, rsrc: string, rsrcId: string | number ) => {
  const newLog = {
    userId: userId,
    action: action,
    resource: rsrc,
    resourceId: rsrcId,
  };

  const log = new Log(newLog);
  await log.save();
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    return res.send({ logs });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting logs" });
  }
};

export default createLog;
