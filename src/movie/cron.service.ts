import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MovieService } from './movie.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly movieService: MovieService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'UTC' })
  async handleCron() {
    this.logger.log('Cron job running to fetch and save movies...');
    await this.movieService.fetchAndSaveMovies();
  }

  async onModuleInit() {
    this.logger.log('Fetching and saving movies on application start...');
    await this.movieService.fetchAndSaveMovies();
  }
}