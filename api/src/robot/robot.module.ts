import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RobotController } from './robot.controller';
import { RobotService } from './robot.service';
import { Robot } from './entities/robot.entity';
import { MovementHistory } from './entities/movement-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Robot, MovementHistory])],
  controllers: [RobotController],
  providers: [RobotService],
})
export class RobotModule {}
