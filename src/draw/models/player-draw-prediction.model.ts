import { Round } from '../../shared/enums/round.enum';

export class PlayerDrawPrediction {
  playerId: string;
  prediction: Record<Round, number>;
}
