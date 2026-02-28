import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player/player.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TournamentDrawRepository } from './draw/repositories/tournament-draw.repository';
import { EloRating } from './elorating/elorating.entity';
import { DrawPredictionService } from './draw/services/draw-prediction.service';
import { DrawController } from './draw/draw.controller';
import { EloratingRepository } from './elorating/elorating.repository';
import { TournamentDraw } from './draw/entities/tournament-draw.entity';
import { TournamentDrawMatch } from './draw/entities/tournament-draw-match.entity';
import { PlayerRepository } from './player/player.repository';
import { PlayerService } from './player/player.service';
import { TournamentDrawService } from './draw/services/tournament-draw.service';
import { TournamentDrawMatchRepository } from './draw/repositories/tournament-draw-match.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forFeature([
      Player,
      EloRating,
      TournamentDraw,
      TournamentDrawMatch,
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
  ],
  controllers: [DrawController],
  providers: [
    PlayerService,
    TournamentDrawRepository,
    DrawPredictionService,
    EloratingRepository,
    PlayerRepository,
    TournamentDrawService,
    TournamentDrawMatchRepository,
  ],
})
export class AppModule {}
