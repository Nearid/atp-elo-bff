import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentDrawMatch } from '../entities/tournament-draw-match.entity';

@Injectable()
export class TournamentDrawMatchRepository {
  constructor(
    @InjectRepository(TournamentDrawMatch)
    private repository: Repository<TournamentDrawMatch>,
  ) {}

  getFirstRoundMatchesByDrawId(drawId: number): Promise<TournamentDrawMatch[]> {
    return this.repository
      .createQueryBuilder('match')
      .innerJoin('match.tournamentDraw', 'draw')
      .where('draw.id = :drawId', { drawId })
      .andWhere('draw.firstRound = match.round')
      .getMany();
  }
}
