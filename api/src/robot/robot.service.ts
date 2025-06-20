import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    try {
      const robot = await this.getCurrentRobot();

      if (!robot && command.type !== CommandType.PLACE) {
        throw new BadRequestException(
          'Robot must be placed on the board first',
        );
      }

      switch (command.type) {
        case CommandType.PLACE:
          if (
            command.x === undefined ||
            command.y === undefined ||
            !command.direction
          ) {
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to execute command');
    }
  }

  private async getCurrentRobot(): Promise<Robot | null> {
    try {
      return await this.robotRepository.findOne({
        order: { updatedAt: 'DESC' },
        where: {},
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch robot state');
    }
  }

  private async place(command: RobotCommandDto): Promise<RobotPositionDto> {
    try {
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
      await this.recordMovement(command, savedRobot);

      return this.report(savedRobot);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to place robot');
    }
  }

  private async move(robot: Robot): Promise<RobotPositionDto> {
    try {
      const newPosition = this.calculateNewPosition(robot);

      if (!this.isValidPosition(newPosition)) {
        throw new BadRequestException('Move would place robot out of bounds');
      }

      robot.x = newPosition.x;
      robot.y = newPosition.y;
      const savedRobot = await this.robotRepository.save(robot);
      await this.recordMovement({ type: CommandType.MOVE }, savedRobot);

      return this.report(savedRobot);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to move robot');
    }
  }

  private async rotate(
    robot: Robot,
    direction: CommandType.LEFT | CommandType.RIGHT,
  ): Promise<RobotPositionDto> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to rotate robot');
    }
  }

  private report(robot: Robot): RobotPositionDto {
    if (
      !robot ||
      robot.x === undefined ||
      robot.y === undefined ||
      !robot.direction
    ) {
      throw new BadRequestException('Invalid robot state');
    }
    return {
      x: robot.x,
      y: robot.y,
      direction: robot.direction,
    };
  }

  private calculateNewPosition(robot: Robot): RobotPositionDto {
    if (
      !robot ||
      robot.x === undefined ||
      robot.y === undefined ||
      !robot.direction
    ) {
      throw new BadRequestException(
        'Invalid robot state for movement calculation',
      );
    }

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
      default:
        throw new BadRequestException('Invalid direction');
    }

    return position;
  }

  private isValidPosition(position: RobotPositionDto): boolean {
    if (
      position.x === undefined ||
      position.y === undefined ||
      !position.direction
    ) {
      return false;
    }
    return (
      position.x >= 0 && position.x <= 4 && position.y >= 0 && position.y <= 4
    );
  }

  private async recordMovement(
    command: RobotCommandDto,
    robot: Robot,
  ): Promise<void> {
    try {
      const history = this.movementHistoryRepository.create({
        command: command.type,
        x: command.x,
        y: command.y,
        direction: command.direction,
        robot,
      });

      await this.movementHistoryRepository.save(history);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to record movement history',
      );
    }
  }
}
