import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { CronService } from './cron.service';
import { Movie } from './models/movie.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Movie.modelName,
        schema: getModelForClass(Movie).schema,
      },
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieService, CronService],
  exports: [MovieService],
})
export class MovieModule {}