import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class EloRating {
  @PrimaryColumn()
  playerId: number;

  @PrimaryColumn({ type: 'timestamp' })
  date: Date;

  @PrimaryColumn()
  tournamentId: number;

  @Column()
  globalRating: number;

  @Column()
  hardRating: number;

  @Column()
  clayRating: number;

  @Column()
  grassRating: number;
}
