import { Round } from '../../shared/enums/round.enum';
import { PlayerDrawPrediction } from './player-draw-prediction.model';

export class DrawPrediction {
  fromRound?: Round;
  playerPredictions: PlayerDrawPrediction[];
}
