import { model, Schema, Document } from "mongoose";

// definir los campos del modelo
interface IUser extends Document {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  createdAt?: Date;
}

// esquema del modelo con sus campos
const logSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // fecha actual cuando se agrega un registro
  }
);

// exportar model indicando su <interfaz>, nombre del model y el esquema a utilizar
export = model<IUser>("Log", logSchema);
