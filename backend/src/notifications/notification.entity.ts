import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Todo } from '../todos/todo.entity';
import { User } from '../users/user.entity';

export enum NotificationType {
  TODO_REMINDER = 'todo_reminder',
  TODO_OVERDUE = 'todo_overdue',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Todo, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'todoId' })
  todo: Todo;

  @Column({ nullable: true })
  todoId: string;

  @CreateDateColumn()
  createdAt: Date;
}
