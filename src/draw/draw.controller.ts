import { Controller, Get, Param } from '@nestjs/common';
import { DrawPrediction } from './draw-prediction.model';
import { DrawPredictionService } from './draw-prediction.service';

@Controller('draw')
export class DrawController {
  constructor(private drawPredictionService: DrawPredictionService) {}

  @Get('/:drawId/prediction')
  getPrediction(@Param('drawId') drawId: number): Promise<DrawPrediction[]> {
    return this.drawPredictionService.getDrawPredictions(drawId);
  }
}
