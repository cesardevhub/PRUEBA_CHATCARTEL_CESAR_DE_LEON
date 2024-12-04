// dependencia para manejo de contraseñas
import bcrypt from "bcrypt";

/**
 * Encriptar contraseña
 * @param password
 * @returns
 */
export const encrypt = async (password: string) => {
  try {
    return bcrypt.hashSync(password, 10);
  } catch (err) {
    throw new Error(`bcrypt - ${err}`);
  }
};

/**
 * Validar que la información venga sin ser nula, indefinida o vacía
 * @param data
 * @returns
 */
export const validateData = (data: Record<string | number, any>) => {
  let keys = Object.keys(data);
  let msg = "";

  for (let key of keys) {
    let param = typeof data[key] == "number" ? `${data[key]}` : data[key];

    if (param.replace(/[ ]+/g, "") != "") {
      continue;
    }

    msg += `Param ${key} is required. `;
  }

  return msg;
};

/**
 * Validar que dos contraseñas coincidan
 * @param password - normal
 * @param hash - encriptada
 * @returns
 */
export const compare = async (password: string, hash: string) => {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    throw new Error(`compare - ${err}`);
  }
};
