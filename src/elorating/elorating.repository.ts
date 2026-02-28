import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EloRating } from './elorating.entity';
import { PlayerRatingDto } from '../draw/models/player-rating.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EloratingRepository {
  constructor(
    @InjectRepository(EloRating)
    private repository: Repository<EloRating>,
    private dataSource: DataSource,
  ) {}

  findPlayersRating(playerIds: string[]): Promise<PlayerRatingDto[]> {
    const matches = this.dataSource
      .createQueryBuilder()
      .addSelect('elo.playerId', 'playerId')
      .addSelect('elo.globalRating', 'globalRating')
      .addSelect('elo.hardRating', 'hardRating')
      .addSelect('elo.clayRating', 'clayRating')
      .addSelect('elo.grassRating', 'grassRating')
      .addSelect(
        'row_number() over (partition by elo.playerId order by elo.date desc)',
        'rn',
      )
      .from(EloRating, 'elo')
      .where('elo.playerId in (:...playerIds)', { playerIds });

    return this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(matches, 'm')
      .select('*')
      .from('m', 'm')
      .where('m.rn = 1')
      .printSql()
      .getRawMany();
  }
}
