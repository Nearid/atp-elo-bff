import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DrawPrediction } from './models/draw-prediction.model';
import { DrawPredictionService } from './services/draw-prediction.service';
import { PlayerDto } from '../player/player.dto';
import { TournamentDrawService } from './services/tournament-draw.service';

@Controller('draw')
export class DrawController {
  constructor(
    private drawPredictionService: DrawPredictionService,
    private tournamentDrawService: TournamentDrawService,
  ) {}

  @Get('/:drawId/prediction')
  getPrediction(
    @Param('drawId', ParseIntPipe) drawId: number,
  ): Promise<DrawPrediction[]> {
    return this.drawPredictionService.getDrawPredictions(drawId);
  }

  @Get('/:drawId/players')
  async getPlayers(
    @Param('drawId', ParseIntPipe) drawId: number,
  ): Promise<PlayerDto[]> {
    return (await this.tournamentDrawService.getPlayers(drawId)).map(
      (player) => ({ id: player.id, fullName: player.fullName }) as PlayerDto,
    );
  }
}
