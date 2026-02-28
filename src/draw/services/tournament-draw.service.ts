import { Injectable } from '@nestjs/common';
import { Player } from '../../player/player.entity';
import { TournamentDrawMatchRepository } from '../repositories/tournament-draw-match.repository';
import { TournamentDrawMatch } from '../entities/tournament-draw-match.entity';
import { PlayerRepository } from '../../player/player.repository';

@Injectable()
export class TournamentDrawService {
  constructor(
    private drawMatchRepository: TournamentDrawMatchRepository,
    private playerRepository: PlayerRepository,
  ) {}

  async getPlayers(drawId: number): Promise<Player[]> {
    const firstRoundMatches =
      await this.drawMatchRepository.getFirstRoundMatchesByDrawId(drawId);

    const playerIds = Array.from(this.extractPlayerIds(firstRoundMatches));
    return this.playerRepository.findAllByIds(playerIds);
  }

  private extractPlayerIds(matches: TournamentDrawMatch[]): Set<string> {
    return new Set(
      matches
        .flatMap((m) => [m.player1Id, m.player2Id])
        .filter((playerId) => !!playerId),
    );
  }
}
