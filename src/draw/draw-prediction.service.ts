import { TournamentDrawRepository } from './tournament-draw.repository';
import { DrawPrediction } from './draw-prediction.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TournamentDraw } from './tournament-draw.entity';
import { EloratingRepository } from '../elorating/elorating.repository';
import { Surface } from '../shared/enums/surface.enum';
import { PlayerRatingDto } from './player-rating.dto';
import { DrawPredictionCalculator } from './draw-prediction-calculator';

@Injectable()
export class DrawPredictionService {
  constructor(
    private tournamentDrawRepository: TournamentDrawRepository,
    private eloRatingRepository: EloratingRepository,
  ) {}

  async getDrawPredictions(
    tournamentDrawId: number,
  ): Promise<DrawPrediction[]> {
    const draw =
      await this.tournamentDrawRepository.findByIdWithMatches(tournamentDrawId);

    if (!draw) {
      throw new NotFoundException();
    }

    const playerIds = this.extractPlayerIds(draw);
    const playerRatings = await this.eloRatingRepository.findPlayersRating(
      Array.from(playerIds),
    );

    const globalElos = new Map<string, number>();
    const surfaceElos = new Map<string, number>();

    playerRatings.forEach((pr) => {
      globalElos.set(pr.playerId, pr.globalRating);
      surfaceElos.set(pr.playerId, this.getSurfaceElo(draw.surface, pr));
    });

    const predCalculator = new DrawPredictionCalculator(
      draw,
      globalElos,
      surfaceElos,
    );
    const drawPreds = predCalculator.computeDrawPredictions();
    drawPreds.push({
      playerPredictions: predCalculator.computeLatest(),
    } as DrawPrediction);

    return drawPreds;
  }

  private extractPlayerIds(draw: TournamentDraw): Set<string> {
    return new Set(
      draw.matches
        .filter((m) => m.round === draw.firstRound)
        .flatMap((m) => [m.player1Id, m.player2Id])
        .filter((playerId) => !!playerId),
    );
  }

  private getSurfaceElo(
    surface: Surface,
    playerRating: PlayerRatingDto,
  ): number {
    switch (surface) {
      case Surface.HARD:
        return playerRating.hardRating;
      case Surface.CLAY:
        return playerRating.clayRating;
      case Surface.GRASS:
        return playerRating.grassRating;
    }
  }
}
