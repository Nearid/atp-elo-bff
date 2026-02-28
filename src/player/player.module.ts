import { Module } from '@nestjs/common';
import { PlayerRepository } from './player.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [PlayerRepository],
  exports: [PlayerRepository],
})
export class PlayerModule {}
