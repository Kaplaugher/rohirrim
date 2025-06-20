import { Controller, Post, Body, Get } from '@nestjs/common';
import { RobotService } from './robot.service';
import { RobotCommandDto, CommandType } from './dto/robot-command.dto';
import { RobotPositionDto } from './dto/robot-position.dto';
import { BadRequestException } from '@nestjs/common';

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
    try {
      return await this.robotService.executeCommand({
        type: CommandType.REPORT,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message === 'Robot must be placed on the board first'
      ) {
        return null;
      }
      throw error;
    }
  }
}
