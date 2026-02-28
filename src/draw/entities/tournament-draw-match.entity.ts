import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Round } from '../../shared/enums/round.enum';
import { TournamentDraw } from './tournament-draw.entity';
import { Player } from '../../player/player.entity';

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

  @ManyToOne(() => Player)
  player1: Player;

  @Column()
  player2Id: string;

  @ManyToOne(() => Player)
  player2: Player;

  @Column()
  winnerId: string;

  @ManyToOne(() => TournamentDraw)
  tournamentDraw: TournamentDraw;
}
