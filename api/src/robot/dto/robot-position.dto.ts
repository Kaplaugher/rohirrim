import { IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Direction } from './robot-command.dto';

export class RobotPositionDto {
  @IsNumber()
  @Min(0)
  @Max(4)
  x: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  y: number;

  @IsEnum(Direction)
  direction: Direction;
} 