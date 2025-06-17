import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Robot } from './entities/robot.entity';
import { MovementHistory } from './entities/movement-history.entity';
import {
  RobotCommandDto,
  Direction,
  CommandType,
} from './dto/robot-command.dto';
import { RobotPositionDto } from './dto/robot-position.dto';

@Injectable()
export class RobotService {
  constructor(
    @InjectRepository(Robot)
    private robotRepository: Repository<Robot>,
    @InjectRepository(MovementHistory)
    private movementHistoryRepository: Repository<MovementHistory>,
  ) {}

  async executeCommand(
    command: RobotCommandDto,
  ): Promise<RobotPositionDto | null> {
    const robot = await this.getCurrentRobot();

    if (!robot && command.type !== CommandType.PLACE) {
      return null;
    }

    switch (command.type) {
      case CommandType.PLACE:
        return this.place(command);
      case CommandType.MOVE:
        return this.move(robot);
      case CommandType.LEFT:
        return this.rotate(robot, CommandType.LEFT);
      case CommandType.RIGHT:
        return this.rotate(robot, CommandType.RIGHT);
      case CommandType.REPORT:
        return this.report(robot);
      default:
        return null;
    }
  }

  private async getCurrentRobot(): Promise<Robot | null> {
    return this.robotRepository.findOne({
      order: { updatedAt: 'DESC' },
      where: {},
    });
  }

  private async place(command: RobotCommandDto): Promise<RobotPositionDto> {
    // Delete existing robot if any
    await this.robotRepository.clear();

    const robot = this.robotRepository.create({
      x: command.x,
      y: command.y,
      direction: command.direction,
    });

    await this.robotRepository.save(robot);
    await this.recordMovement(command, robot);

    return this.report(robot);
  }

  private async move(robot: Robot): Promise<RobotPositionDto | null> {
    const newPosition = this.calculateNewPosition(robot);

    if (!this.isValidPosition(newPosition)) {
      return null;
    }

    robot.x = newPosition.x;
    robot.y = newPosition.y;
    await this.robotRepository.save(robot);
    await this.recordMovement({ type: CommandType.MOVE }, robot);

    return this.report(robot);
  }

  private async rotate(
    robot: Robot,
    direction: CommandType.LEFT | CommandType.RIGHT,
  ): Promise<RobotPositionDto> {
    const directions = [
      Direction.NORTH,
      Direction.EAST,
      Direction.SOUTH,
      Direction.WEST,
    ];
    const currentIndex = directions.indexOf(robot.direction);
    const newIndex =
      direction === CommandType.LEFT
        ? (currentIndex + 3) % 4
        : (currentIndex + 1) % 4;

    robot.direction = directions[newIndex];
    await this.robotRepository.save(robot);
    await this.recordMovement({ type: direction }, robot);

    return this.report(robot);
  }

  private report(robot: Robot): RobotPositionDto {
    return {
      x: robot.x,
      y: robot.y,
      direction: robot.direction,
    };
  }

  private calculateNewPosition(robot: Robot): RobotPositionDto {
    const position = { ...robot };

    switch (robot.direction) {
      case Direction.NORTH:
        position.y += 1;
        break;
      case Direction.SOUTH:
        position.y -= 1;
        break;
      case Direction.EAST:
        position.x += 1;
        break;
      case Direction.WEST:
        position.x -= 1;
        break;
    }

    return position;
  }

  private isValidPosition(position: RobotPositionDto): boolean {
    return (
      position.x >= 0 && position.x <= 4 && position.y >= 0 && position.y <= 4
    );
  }

  private async recordMovement(
    command: RobotCommandDto,
    robot: Robot,
  ): Promise<void> {
    const history = this.movementHistoryRepository.create({
      command: command.type,
      x: command.x,
      y: command.y,
      direction: command.direction,
      robot,
    });

    await this.movementHistoryRepository.save(history);
  }
}
