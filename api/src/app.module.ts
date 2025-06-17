import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RobotModule } from './robot/robot.module';
import { Robot } from './robot/entities/robot.entity';
import { MovementHistory } from './robot/entities/movement-history.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'robot_simulator.sqlite',
      entities: [Robot, MovementHistory],
      synchronize: true, // Set to false in production
    }),
    RobotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
