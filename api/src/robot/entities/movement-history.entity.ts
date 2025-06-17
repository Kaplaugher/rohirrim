import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Robot } from './robot.entity';
import { CommandType, Direction } from '../dto/robot-command.dto';

@Entity()
export class MovementHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  command: CommandType;

  @Column({ nullable: true })
  x: number;

  @Column({ nullable: true })
  y: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  direction: Direction;

  @ManyToOne(() => Robot)
  @JoinColumn()
  robot: Robot;

  @CreateDateColumn()
  createdAt: Date;
}
