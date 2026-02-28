import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PlayerRepository {
  constructor(
    @InjectRepository(Player) private repository: Repository<Player>,
  ) {}

  findAllByIds(playerIds: string[]): Promise<Player[]> {
    return this.repository.findBy({ id: In(playerIds) });
  }
}
