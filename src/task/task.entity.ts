import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import Project from "../project/project.entity";
import User from "../user/user.entity";

// definir tipos de datos para task
export interface TaskData {
  name: string;
  description: string;
  status: string;
  userId: string;
  [key: string]: string;
}

// definir entidad de tarea (task) con sus columnas
@Entity("task")
export default class Task extends BaseEntity {
  
  // llave primaria
  @PrimaryGeneratedColumn()
  taskId: number;

  // relación muchos a uno con la entidad project (llave foranea)
  @ManyToOne(() => Project, (project) => project.tasks)
  projectId: Project;

  // relación muchos a uno con la entidad user (llave foranea)
  @ManyToOne(() => User, (user) => user.tasks)
  userId: User;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  status: string;

  // fecha actual cuando se agrega un registro
  @CreateDateColumn()
  date_created: Date;

  // fecha actual cuando se actualiza un registro
  @UpdateDateColumn()
  date_updated: Date;
}
