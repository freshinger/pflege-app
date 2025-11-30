import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Todo } from '../todos/todo.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: 'nurse' })
  role: string;

  @OneToMany(() => Todo, (todo) => todo.assignedTo)
  todos: Todo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
