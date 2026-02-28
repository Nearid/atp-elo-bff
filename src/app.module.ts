import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from './player/player.controller';
import { PlayerService } from './player/player.service';
import { Player } from './player/player.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TournamentDrawRepository } from './draw/tournament-draw.repository';
import { EloRating } from './elorating/elorating.entity';
import { DrawPredictionService } from './draw/draw-prediction.service';
import { DrawController } from './draw/draw.controller';
import { EloratingRepository } from './elorating/elorating.repository';
import { TournamentDraw } from './draw/tournament-draw.entity';
import { TournamentDrawMatch } from './draw/tournament-draw-match.entity';

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
  controllers: [PlayerController, DrawController],
  providers: [
    PlayerService,
    TournamentDrawRepository,
    DrawPredictionService,
    EloratingRepository,
  ],
})
export class AppModule {}
