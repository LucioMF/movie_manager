import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from '../movie.service';
import axios from 'axios';
import { getModelToken } from '@nestjs/mongoose';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('axios');

describe('MovieService', () => {
  let service: MovieService;
  let movieModel: any;

  const mockModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken('Movie'),
          useValue: mockModel,
        }
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieModel = module.get(getModelToken('Movie'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and save movies', async () => {
    const moviesResponse = {
      data: {
        results: [
          {
            title: 'A New Hope',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            director: 'George Lucas',
            producer: 'Gary Kurtz',
            release_date: '1977-05-25',
          },
        ],
      },
    };

    (axios.get as jest.Mock).mockResolvedValue(moviesResponse);
    movieModel.findOne.mockResolvedValue(null); // Simulate that no movies exist

    await service.fetchAndSaveMovies();

    expect(axios.get).toHaveBeenCalledWith('https://swapi.dev/api/films/');
    expect(movieModel.findOne).toHaveBeenCalledWith({ title: 'A New Hope' });
    expect(mockModel.create).toHaveBeenCalled();
  });

  it('should not save existing movies', async () => {
    const moviesResponse = {
      data: {
        results: [
          {
            title: 'A New Hope',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            director: 'George Lucas',
            producer: 'Gary Kurtz',
            release_date: '1977-05-25',
          },
        ],
      },
    };

    (axios.get as jest.Mock).mockResolvedValue(moviesResponse);
    movieModel.findOne.mockResolvedValue({ title: 'A New Hope' }); // Simulate that the movie already exists

    await service.fetchAndSaveMovies();

    expect(axios.get).toHaveBeenCalledWith('https://swapi.dev/api/films/');
    expect(movieModel.findOne).toHaveBeenCalledWith({ title: 'A New Hope' });
    expect(mockModel.create).not.toHaveBeenCalled(); 
  });

  it('should handle errors gracefully', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    await expect(service.fetchAndSaveMovies()).rejects.toThrow(
      InternalServerErrorException
    );
  });


  it('should find all movies', async () => {
    const mockMovies = [{ title: 'A New Hope' }];
    mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockMovies) });

    const result = await service.findAll();
    expect(result).toEqual(mockMovies);
  });

  it('should find Movie by ID', async () => {
    const mockMovie = { title: 'A New Hope' };
    mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockMovie) });

    const result = await service.findById('507f1f77bcf86cd799439011');
    expect(result).toEqual(mockMovie);
  });

  it('should update Movie by ID', async () => {
    const updatedMovie = { title: 'Updated Movie' };
    mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedMovie) });

    const result = await service.update('507f1f77bcf86cd799439011', updatedMovie);
    expect(result).toEqual(updatedMovie);
  });

  it('should delete Movie by ID', async () => {
    mockModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const result = await service.delete('507f1f77bcf86cd799439011');
    expect(result).toBeNull();
  });
});
