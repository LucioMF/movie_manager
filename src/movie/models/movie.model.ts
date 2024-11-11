import { BaseModel } from '../../shared/base.model';
import { prop, ReturnModelType, getModelForClass } from '@typegoose/typegoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class Movie extends BaseModel<Movie> {
    @IsNotEmpty()
    @ApiProperty()
    @prop({ required: [true, 'Title is required'], trim: true })
    title: string;

    @IsNotEmpty()
    @ApiProperty()
    @prop({ required: [true, 'Episode is required'] })
    episode: number;

    @ApiPropertyOptional()
    @IsOptional()
    @prop()
    opening_crawl: string;

    @ApiPropertyOptional()
    @IsOptional()
    @prop()
    director: string;

    @ApiPropertyOptional()
    @IsOptional()
    @prop()
    producer: string;

    @ApiPropertyOptional()
    @IsOptional()
    @prop()
    release_date: string;

    static get model(): ReturnModelType<typeof Movie> {
        return getModelForClass(Movie);
    }

    static get modelName(): string {
        return 'Movie';
    }
}