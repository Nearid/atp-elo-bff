import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Round } from '../shared/enums/round.enum';
import { TournamentDraw } from './tournament-draw.entity';

@Entity()
export class TournamentDrawMatch {
  @PrimaryColumn()
  tournamentDrawId: number;

  @PrimaryColumn()
  matchNumber: number;

  @PrimaryColumn({ type: 'enum', enum: Round })
  round: Round;

  @Column()
  player1Id: string;

  @Column()
  player2Id: string;

  @Column()
  winnerId: string;

  @ManyToOne(() => TournamentDraw)
  tournamentDraw: TournamentDraw;
}
