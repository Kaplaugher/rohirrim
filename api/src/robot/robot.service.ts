import { Injectable, BadRequestException } from '@nestjs/common';
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

  async executeCommand(command: RobotCommandDto): Promise<RobotPositionDto> {
    const robot = await this.getCurrentRobot();

    if (!robot && command.type !== CommandType.PLACE) {
      throw new BadRequestException('Robot must be placed on the board first');
    }

    switch (command.type) {
      case CommandType.PLACE:
        if (!command.x || !command.y || !command.direction) {
          throw new BadRequestException('Invalid PLACE command parameters');
        }
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
        throw new BadRequestException('Invalid command type');
    }
  }

  private async getCurrentRobot(): Promise<Robot | null> {
    return this.robotRepository.findOne({
      order: { updatedAt: 'DESC' },
      where: {},
    });
  }

  private async place(command: RobotCommandDto): Promise<RobotPositionDto> {
    if (
      !this.isValidPosition({
        x: command.x,
        y: command.y,
        direction: command.direction,
      })
    ) {
      throw new BadRequestException('Invalid position for placement');
    }

    // Delete existing robot if any
    await this.movementHistoryRepository.clear(); // Clear history first
    await this.robotRepository.clear();

    // Create and save new robot
    const robot = this.robotRepository.create({
      x: command.x,
      y: command.y,
      direction: command.direction,
    });

    const savedRobot = await this.robotRepository.save(robot);

    // Create movement history
    const history = this.movementHistoryRepository.create({
      command: command.type,
      x: command.x,
      y: command.y,
      direction: command.direction,
      robot: savedRobot,
    });

    await this.movementHistoryRepository.save(history);

    return this.report(savedRobot);
  }

  private async move(robot: Robot): Promise<RobotPositionDto> {
    const newPosition = this.calculateNewPosition(robot);

    if (!this.isValidPosition(newPosition)) {
      throw new BadRequestException('Move would place robot out of bounds');
    }

    robot.x = newPosition.x;
    robot.y = newPosition.y;
    const savedRobot = await this.robotRepository.save(robot);
    await this.recordMovement({ type: CommandType.MOVE }, savedRobot);

    return this.report(savedRobot);
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
    const savedRobot = await this.robotRepository.save(robot);
    await this.recordMovement({ type: direction }, savedRobot);

    return this.report(savedRobot);
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
