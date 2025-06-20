import { Test, TestingModule } from '@nestjs/testing';
import { RobotController } from './robot.controller';
import { RobotService } from './robot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Robot } from './entities/robot.entity';
import { MovementHistory } from './entities/movement-history.entity';
import { BadRequestException } from '@nestjs/common';
import { CommandType, Direction } from './dto/robot-command.dto';

describe('RobotController', () => {
  let appController: RobotController;
  let robotRepo;
  let historyRepo;

  beforeEach(async () => {
    robotRepo = {
      findOne: jest.fn(),
      clear: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    historyRepo = {
      create: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [RobotController],
      providers: [
        RobotService,
        { provide: getRepositoryToken(Robot), useValue: robotRepo },
        { provide: getRepositoryToken(MovementHistory), useValue: historyRepo },
      ],
    }).compile();

    appController = app.get<RobotController>(RobotController);
  });

  describe('getCurrentPosition', () => {
    it('should return null when no robot is placed', async () => {
      robotRepo.findOne.mockResolvedValue(null);
      expect(await appController.getCurrentPosition()).toBe(null);
    });

    it('should return current position when robot exists', async () => {
      const position = {
        x: 2,
        y: 3,
        direction: Direction.EAST,
      };
      robotRepo.findOne.mockResolvedValue(position);
      const result = await appController.getCurrentPosition();
      expect(result).toEqual(position);
    });

    it('should throw other BadRequestException errors', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: undefined,
        y: 0,
        direction: Direction.NORTH,
      });
      await expect(appController.getCurrentPosition()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('executeCommand', () => {
    it('should execute PLACE command successfully', async () => {
      const position = {
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      };
      robotRepo.create.mockReturnValue(position);
      robotRepo.save.mockResolvedValue(position);

      const result = await appController.executeCommand({
        type: CommandType.PLACE,
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });

      expect(result).toEqual(position);
    });

    it('should execute MOVE command successfully', async () => {
      const initialPosition = {
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      };
      const newPosition = {
        x: 0,
        y: 1,
        direction: Direction.NORTH,
      };
      robotRepo.findOne.mockResolvedValue(initialPosition);
      robotRepo.save.mockResolvedValue(newPosition);

      const result = await appController.executeCommand({
        type: CommandType.MOVE,
      });

      expect(result).toEqual(newPosition);
    });

    it('should execute rotation commands successfully', async () => {
      const initialPosition = {
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      };
      const newPosition = {
        x: 0,
        y: 0,
        direction: Direction.WEST,
      };
      robotRepo.findOne.mockResolvedValue(initialPosition);
      robotRepo.save.mockResolvedValue(newPosition);

      const result = await appController.executeCommand({
        type: CommandType.LEFT,
      });

      expect(result).toEqual(newPosition);
    });

    it('should handle invalid commands', async () => {
      await expect(
        appController.executeCommand({
          type: 'INVALID' as CommandType,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
