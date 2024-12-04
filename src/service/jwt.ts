// dependencia para manejo de token
import jwt from "jsonwebtoken";

/**
 * Generar token que vence después de 2 horas
 * @param user
 * @returns
 */
export const createToken = async (user: Record<string, any>) => {
  try {
    // información del usuario
    let payload = {
      id: user.userId,
      name: user.firstname,
      lastname: user.lastname,
      email: user.email,
      rol: user.rol,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 120,
    };

    // retornar el token con jwt
    return jwt.sign(payload, `${process.env.SECRET_KEY}`);
  } catch (err) {
    console.log(err);
  }
};
