import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import axios from 'axios';
import { Movie } from './models/movie.model';
import { BaseService } from '../shared/base.service';

@Injectable()
export class MovieService extends BaseService<Movie> {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectModel('Movie') private readonly movieModel: ReturnModelType<typeof Movie>,
  ) {
    super();
    this.model = movieModel;
  }

  async fetchAndSaveMovies(): Promise<void> {
    try {
      const response = await axios.get('https://swapi.dev/api/films/');
      const movies = response.data.results;

      for (const movie of movies) {
        const existingMovie = await this.movieModel.findOne({ title: movie.title });
        if (!existingMovie) {
            await this.movieModel.create({
                title: movie.title,
                episode: movie.episode_id,
                opening_crawl: movie.opening_crawl,
                director: movie.director,
                producer: movie.producer,
                release_date: movie.release_date,
                });
          this.logger.log(`Saved new movie: ${movie.title}`);
        } else {
          this.logger.log(`Movie already exists: ${movie.title}`);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch and save movies', error.message);
    }
  }

//   async findById(id: string): Promise<Movie> {
//     const movie = await this.movieModel.findById(id).exec();
//     if (!movie) {
//       throw new InternalServerErrorException(`Movie with ID ${id} not found`);
//     }
//     return movie;
//   }

//   async findAll(): Promise<Movie[]> {
//     return this.movieModel.find().exec();
//   }

//   async create(movieData: Movie): Promise<Movie> {
//     const newMovie = new this.movieModel(movieData);
//     return newMovie.save();
//   }

//   async update(id: string, movieData: Partial<Movie>): Promise<Movie> {
//     const updatedMovie = await this.movieModel.findByIdAndUpdate(id, movieData, { new: true }).exec();
//     if (!updatedMovie) {
//       throw new InternalServerErrorException(`Movie with ID ${id} not found`);
//     }
//     return updatedMovie;
//   }

//   async delete(id: string): Promise<void> {
//     const result = await this.movieModel.findByIdAndDelete(id).exec();
//     if (!result) {
//       throw new InternalServerErrorException(`Movie with ID ${id} not found`);
//     }
//   }
}