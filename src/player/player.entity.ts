import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;
}
