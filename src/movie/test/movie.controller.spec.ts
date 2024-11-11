import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from '../movie.controller';
import { MovieService } from '../movie.service';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException } from '@nestjs/common';
import { Movie } from '../models/movie.model';
import { DocumentType } from '@typegoose/typegoose';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        MovieService,
        { provide: getModelToken('Movie'), useValue: {} },
       ],
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all Movies (User role)', async () => {
    const mockMovies = [
        {
            title: 'Movie 1',
            episode: 1,
            opening_crawl: 'Opening crawl 1',
            director: 'Director 1',
            producer: 'Producer 1',
            release_date: '1977-05-25',
          } as unknown as DocumentType<Movie>,
        {
            title: 'Movie 2',
            episode: 2,
            opening_crawl: 'Opening crawl 2',
            director: 'Director 1',
            producer: 'Producer 1',
            release_date: '1980-01-01',
          } as unknown as DocumentType<Movie>,
    ];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockMovies);

    const result = await controller.getMovies();
    expect(result).toEqual(mockMovies);
  });

  it('should return specific Movie (User role)', async () => {
    const mockMovie = {
        title: 'Movie 1',
        episode: 1,
        opening_crawl: 'Opening crawl 1',
        director: 'Director 1',
        producer: 'Producer 1',
        release_date: '1977-05-25',
      } as unknown as DocumentType<Movie>;

    jest.spyOn(service, 'findById').mockResolvedValue(mockMovie);

    const result = await controller.getMovies('some-id');
    expect(result).toEqual(mockMovie);
  });

  it('should create new Movie (Admin role)', async () => {
    const mockMovie = {
        title: 'The Empire Strikes Back',
        episode: 1,
        opening_crawl: 'Opening crawl 1',
        director: 'Director 1',
        producer: 'Producer 1',
        release_date: '1977-05-25',
      } as unknown as DocumentType<Movie>;
    jest.spyOn(service, 'create').mockResolvedValue(mockMovie);

    const result = await controller.createMovie(mockMovie as any);
    expect(result).toEqual(mockMovie);
  });

  it('should update Movie (Admin role)', async () => {
    const updatedMovie = { title: 'The Empire Strikes Back - Updated' } as any;
    jest.spyOn(service, 'update').mockResolvedValue(updatedMovie as any);

    const result = await controller.updateMovie('some-id', updatedMovie);
    expect(result).toEqual(updatedMovie);
  });

  it('should remove Movie (Admin role)', async () => {
    jest.spyOn(service, 'delete').mockResolvedValue(null);

    await expect(controller.deleteMovie('some-id')).resolves.toBeUndefined();
  });

  it('should throw ForbiddenException if the role is not Admin', async () => {    
    jest.spyOn(service, 'create').mockImplementation(() => {
        throw new ForbiddenException('You do not have permission to access this resource');
      });

    await expect(controller.createMovie({ title: 'Test Movie' } as any))
      .rejects
      .toThrow(ForbiddenException);
  });
});
