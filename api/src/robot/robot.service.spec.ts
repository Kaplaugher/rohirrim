import { Test, TestingModule } from '@nestjs/testing';
import { RobotService } from './robot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Robot } from './entities/robot.entity';
import { MovementHistory } from './entities/movement-history.entity';
import { CommandType, Direction } from './dto/robot-command.dto';
import { BadRequestException } from '@nestjs/common';

describe('RobotService', () => {
  let service: RobotService;
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RobotService,
        { provide: getRepositoryToken(Robot), useValue: robotRepo },
        { provide: getRepositoryToken(MovementHistory), useValue: historyRepo },
      ],
    }).compile();
    service = module.get<RobotService>(RobotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('PLACE command', () => {
    it('should place the robot', async () => {
      robotRepo.create.mockReturnValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      robotRepo.save.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      const result = await service.executeCommand({
        type: CommandType.PLACE,
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      expect(result).toEqual({ x: 0, y: 0, direction: Direction.NORTH });
    });

    it('should reject placement with missing coordinates', async () => {
      await expect(
        service.executeCommand({
          type: CommandType.PLACE,
          direction: Direction.NORTH,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject placement outside board boundaries', async () => {
      await expect(
        service.executeCommand({
          type: CommandType.PLACE,
          x: 5,
          y: 5,
          direction: Direction.NORTH,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should clear existing robot and history when placing new robot', async () => {
      robotRepo.create.mockReturnValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      robotRepo.save.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });

      await service.executeCommand({
        type: CommandType.PLACE,
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });

      expect(robotRepo.clear).toHaveBeenCalled();
      expect(historyRepo.clear).toHaveBeenCalled();
    });
  });

  describe('Movement commands before PLACE', () => {
    it('should reject MOVE before PLACE', async () => {
      robotRepo.findOne.mockResolvedValue(null);
      await expect(
        service.executeCommand({ type: CommandType.MOVE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject LEFT before PLACE', async () => {
      robotRepo.findOne.mockResolvedValue(null);
      await expect(
        service.executeCommand({ type: CommandType.LEFT }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RIGHT before PLACE', async () => {
      robotRepo.findOne.mockResolvedValue(null);
      await expect(
        service.executeCommand({ type: CommandType.RIGHT }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REPORT before PLACE', async () => {
      robotRepo.findOne.mockResolvedValue(null);
      await expect(
        service.executeCommand({ type: CommandType.REPORT }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Movement commands', () => {
    it('should move the robot north', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      robotRepo.save.mockResolvedValue({
        x: 0,
        y: 1,
        direction: Direction.NORTH,
      });
      const result = await service.executeCommand({ type: CommandType.MOVE });
      expect(result.y).toBe(1);
    });

    it('should rotate the robot left', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      robotRepo.save.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.WEST,
      });
      const result = await service.executeCommand({ type: CommandType.LEFT });
      expect(result.direction).toBe(Direction.WEST);
    });

    it('should rotate the robot right', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });
      robotRepo.save.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.EAST,
      });
      const result = await service.executeCommand({ type: CommandType.RIGHT });
      expect(result.direction).toBe(Direction.EAST);
    });

    it('should not move robot off the board northward', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 0,
        y: 4,
        direction: Direction.NORTH,
      });
      await expect(
        service.executeCommand({ type: CommandType.MOVE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not move robot off the board southward', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.SOUTH,
      });
      await expect(
        service.executeCommand({ type: CommandType.MOVE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not move robot off the board eastward', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 4,
        y: 0,
        direction: Direction.EAST,
      });
      await expect(
        service.executeCommand({ type: CommandType.MOVE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not move robot off the board westward', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: 0,
        y: 0,
        direction: Direction.WEST,
      });
      await expect(
        service.executeCommand({ type: CommandType.MOVE }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('REPORT command', () => {
    it('should report current position and direction', async () => {
      const position = {
        x: 2,
        y: 3,
        direction: Direction.EAST,
      };
      robotRepo.findOne.mockResolvedValue(position);
      const result = await service.executeCommand({ type: CommandType.REPORT });
      expect(result).toEqual(position);
    });

    it('should reject report with invalid robot state', async () => {
      robotRepo.findOne.mockResolvedValue({
        x: undefined,
        y: 0,
        direction: Direction.NORTH,
      });
      await expect(
        service.executeCommand({ type: CommandType.REPORT }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Movement history', () => {
    it('should record movement history for PLACE command', async () => {
      const robot = {
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      };
      robotRepo.create.mockReturnValue(robot);
      robotRepo.save.mockResolvedValue(robot);

      await service.executeCommand({
        type: CommandType.PLACE,
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      });

      expect(historyRepo.create).toHaveBeenCalledWith({
        command: CommandType.PLACE,
        x: 0,
        y: 0,
        direction: Direction.NORTH,
        robot,
      });
      expect(historyRepo.save).toHaveBeenCalled();
    });

    it('should record movement history for MOVE command', async () => {
      const robot = {
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      };
      robotRepo.findOne.mockResolvedValue(robot);
      robotRepo.save.mockResolvedValue({ ...robot, y: 1 });

      await service.executeCommand({ type: CommandType.MOVE });

      expect(historyRepo.create).toHaveBeenCalledWith({
        command: CommandType.MOVE,
        robot: { ...robot, y: 1 },
      });
      expect(historyRepo.save).toHaveBeenCalled();
    });

    it('should record movement history for rotation commands', async () => {
      const robot = {
        x: 0,
        y: 0,
        direction: Direction.NORTH,
      };
      robotRepo.findOne.mockResolvedValue(robot);
      robotRepo.save.mockResolvedValue({ ...robot, direction: Direction.WEST });

      await service.executeCommand({ type: CommandType.LEFT });

      expect(historyRepo.create).toHaveBeenCalledWith({
        command: CommandType.LEFT,
        robot: { ...robot, direction: Direction.WEST },
      });
      expect(historyRepo.save).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid command type', async () => {
      await expect(
        service.executeCommand({ type: 'INVALID' as CommandType }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle missing direction in PLACE command', async () => {
      await expect(
        service.executeCommand({
          type: CommandType.PLACE,
          x: 0,
          y: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative coordinates in PLACE command', async () => {
      await expect(
        service.executeCommand({
          type: CommandType.PLACE,
          x: -1,
          y: -1,
          direction: Direction.NORTH,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
