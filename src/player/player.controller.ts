import { Controller, Get, Param } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player } from './player.entity';

@Controller('players')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Get(':id')
  getById(@Param('id') id: string): Promise<Player> {
    return this.playerService.findById(id);
  }
}
