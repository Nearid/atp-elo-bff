import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Surface } from '../shared/enums/surface.enum';
import { Round } from '../shared/enums/round.enum';
import { TournamentDrawMatch } from './tournament-draw-match.entity';

@Entity()
export class TournamentDraw {
  @PrimaryColumn()
  id: number;

  @Column()
  tournamentId: number;

  @Column()
  season: number;

  @Column({ type: 'enum', enum: Surface })
  surface: Surface;

  @Column({ type: 'enum', enum: Round })
  firstRound: Round;

  @OneToMany(() => TournamentDrawMatch, (match) => match.tournamentDraw)
  matches: TournamentDrawMatch[] = [];
}
