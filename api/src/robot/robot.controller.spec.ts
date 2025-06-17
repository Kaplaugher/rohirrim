import { Test, TestingModule } from '@nestjs/testing';
import { RobotController } from './robot.controller';
import { RobotService } from './robot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Robot } from './entities/robot.entity';
import { MovementHistory } from './entities/movement-history.entity';

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
      expect(await appController.getCurrentPosition()).toBe(null);
    });
  });
});
