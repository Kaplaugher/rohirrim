import { Test, TestingModule } from '@nestjs/testing';
import { RobotService } from './robot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Robot } from './entities/robot.entity';
import { MovementHistory } from './entities/movement-history.entity';
import { CommandType, Direction } from './dto/robot-command.dto';

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
    expect(result.y).toBeGreaterThanOrEqual(0);
  });

  it('should rotate the robot left', async () => {
    robotRepo.findOne.mockResolvedValue({
      x: 0,
      y: 0,
      direction: Direction.NORTH,
    });
    robotRepo.save.mockResolvedValue({ x: 0, y: 0, direction: Direction.WEST });
    const result = await service.executeCommand({ type: CommandType.LEFT });
    expect(result.direction).toBe(Direction.WEST);
  });

  it('should rotate the robot right', async () => {
    robotRepo.findOne.mockResolvedValue({
      x: 0,
      y: 0,
      direction: Direction.NORTH,
    });
    robotRepo.save.mockResolvedValue({ x: 0, y: 0, direction: Direction.EAST });
    const result = await service.executeCommand({ type: CommandType.RIGHT });
    expect(result.direction).toBe(Direction.EAST);
  });

  it('should not move robot off the board', async () => {
    robotRepo.findOne.mockResolvedValue({
      x: 0,
      y: 4,
      direction: Direction.NORTH,
    });
    const result = await service.executeCommand({ type: CommandType.MOVE });
    expect(result).toBeNull();
  });
});
