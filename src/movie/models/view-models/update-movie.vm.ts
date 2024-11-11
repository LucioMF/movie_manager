import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateMovieVm {
    @ApiPropertyOptional()
    @IsOptional()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    episode: number;

    @ApiPropertyOptional()
    @IsOptional()
    opening_crawl: string;

    @ApiPropertyOptional()
    @IsOptional()
    director: string;

    @ApiPropertyOptional()
    @IsOptional()
    producer: string;

    @ApiPropertyOptional()
    @IsOptional()
    release_date: string;
}