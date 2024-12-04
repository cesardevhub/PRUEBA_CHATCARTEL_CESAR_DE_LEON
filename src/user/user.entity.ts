import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import Task from "../task/task.entity";

// definir tipos de datos para user
export interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  rol: string;
  [key: string]: string;
}

// definir entidad de usuario (user) con sus columnas
@Entity("user")
export default class User extends BaseEntity {
  // llave primaria
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  rol: string;

  // fecha actual cuando se agrega un registro
  @CreateDateColumn()
  date_created: Date;

  // fecha actual cuando se actualiza un registro
  @UpdateDateColumn()
  date_updated: Date;

  // relación uno a muchos con la entidad task
  @OneToMany(() => Task, (task) => task.userId)
  tasks: Task[];
}
