import { Controller, Post, Body, Get } from '@nestjs/common';
import { RobotService } from './robot.service';
import { RobotCommandDto, CommandType } from './dto/robot-command.dto';
import { RobotPositionDto } from './dto/robot-position.dto';

@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Post('command')
  async executeCommand(
    @Body() command: RobotCommandDto,
  ): Promise<RobotPositionDto | null> {
    return this.robotService.executeCommand(command);
  }

  @Get('position')
  async getCurrentPosition(): Promise<RobotPositionDto | null> {
    return this.robotService.executeCommand({ type: CommandType.REPORT });
  }
}
