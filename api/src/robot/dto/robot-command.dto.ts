import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';

export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
}

export enum CommandType {
  PLACE = 'PLACE',
  MOVE = 'MOVE',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  REPORT = 'REPORT',
}

export class RobotCommandDto {
  @IsEnum(CommandType)
  type: CommandType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  x?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  y?: number;

  @IsOptional()
  @IsEnum(Direction)
  direction?: Direction;
} 