import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import Task from "../task/task.entity";

// definir tipos de datos para project
export interface ProjectData {
  name: string;
  description: string;
  [key: string]: string;
}

// definir entidad de proyecto (project) con sus columnas
@Entity("project")
export default class Project extends BaseEntity {
  
  // llave primaria
  @PrimaryGeneratedColumn()
  projectId: number;

  @Column()
  name: string;

  @Column({nullable: true})
  description: string;

  // fecha actual cuando se agrega un registro
  @CreateDateColumn()
  date_created: Date;

  // fecha actual cuando se actualiza un registro
  @UpdateDateColumn()
  date_updated: Date;

  // relación uno a muchos con la entidad task
  @OneToMany(() => Task, (task) => task.projectId)
  tasks: Task[];
}
