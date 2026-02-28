import { Module } from '@nestjs/common';
import { EloratingRepository } from './elorating.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EloRating } from './elorating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EloRating])],
  providers: [EloratingRepository],
  exports: [EloratingRepository],
})
export class EloratingModule {}
