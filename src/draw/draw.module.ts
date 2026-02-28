import { Module } from '@nestjs/common';
import { DrawController } from './draw.controller';
import { TournamentDrawRepository } from './repositories/tournament-draw.repository';
import { DrawPredictionService } from './services/draw-prediction.service';
import { TournamentDrawService } from './services/tournament-draw.service';
import { TournamentDrawMatchRepository } from './repositories/tournament-draw-match.repository';
import { PlayerModule } from '../player/player.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentDraw } from './entities/tournament-draw.entity';
import { TournamentDrawMatch } from './entities/tournament-draw-match.entity';
import { EloratingModule } from '../elorating/elorating.module';

@Module({
  controllers: [DrawController],
  imports: [
    PlayerModule,
    EloratingModule,
    TypeOrmModule.forFeature([TournamentDraw, TournamentDrawMatch]),
  ],
  providers: [
    TournamentDrawRepository,
    DrawPredictionService,
    TournamentDrawService,
    TournamentDrawMatchRepository,
  ],
})
export class DrawModule {}
