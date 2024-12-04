import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * Agregar el objeto user al request de express
 */
export interface CustomRequest extends Request {
  user: JwtPayload & { rol?: string };
}

// definir datos de req.user
export interface UserToken extends Request {
  user: {
    id: string | number;
    name: string;
    lastname: string;
    email: string;
    rol: string;
    iat: number;
    exp: number;
  };
}

/**
 * Middleware para validar que el usuario esté autenticado
 * @throws 403 - No está autenticado
 * @throws 400 - Autenticación invalida
 */
export const authorization = ( req: Request, res: Response, next: NextFunction ) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: `Doesn't contain headers AUTHORIZATION` });
  }

  try {
    const token = req.headers.authorization.replace(/['"]+/g, "");
    const payload = jwt.verify( token, `${process.env.SECRET_KEY}` ) as JwtPayload;

    (req as CustomRequest).user = payload;

    next();
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Invalid Token" });
  }
};

/**
 * Middleware para validar si es administrador
 * @throws 403 - No es administrador
 */
export const verifyAdmin = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { user } = req as CustomRequest;

    if (user.rol !== "admin" && user.rol != "superadmin") {
      return res.status(403).send({ message: "Unauthorized user for this action" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(403).send({ message: "Unauthorized user" });
  }
};
