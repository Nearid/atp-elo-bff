import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentDraw } from '../entities/tournament-draw.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentDrawRepository {
  constructor(
    @InjectRepository(TournamentDraw)
    private repository: Repository<TournamentDraw>,
  ) {}

  findByIdWithMatches(id: number): Promise<TournamentDraw | null> {
    return this.repository
      .createQueryBuilder('draw')
      .where('draw.id = :id', { id })
      .leftJoinAndSelect('draw.matches', 'matches')
      .getOne();
  }
}
