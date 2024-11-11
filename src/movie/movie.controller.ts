import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Logger, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Movie } from "./models/movie.model";
import { MovieService } from "./movie.service";
import { GetOperationMetadata } from "../shared/utilities/get-operation-metadata";
import { RolesGuard } from "../shared/guards/roles.guard";
import { Roles } from "../shared/decorators/roles.decorator";
import { ApiException } from "../shared/dto-models/api-exception.model";
import { UserRole } from "../user/models/user-role.enum";
import { JwtAuthGuard } from "../shared/guards/auth.guard";
import { UpdateMovieVm } from "./models/view-models/update-movie.vm";
import { ParseMongoIdPipe } from "../shared/pipes/mongo-id-validation.pipe";

@Controller('movie')
@ApiTags(Movie.modelName)
export class MovieController {

    SERVER_URL: string;
    WEB_APP_URL: string;
    private readonly logger = new Logger(MovieController.name);

    constructor(
        private readonly movieService: MovieService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.User, UserRole.Admin)
    @ApiResponse({ status: HttpStatus.OK, type: [Movie] })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, type: ApiException })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
    @ApiOperation(GetOperationMetadata(Movie.modelName, 'Get Details', null, 'Get details from one movie or get all movies'))
    @ApiQuery({ name: 'id', required: false, description: 'ID of the movie to fetch (optional)' })
    async getMovies(@Query('id', ParseMongoIdPipe) id?: string): Promise<Movie | Movie[]> {
        if (id) {
            return this.movieService.findById(id);
        }
        return this.movieService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @ApiResponse({ status: HttpStatus.CREATED, type: Movie })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, type: ApiException })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
    @ApiOperation(GetOperationMetadata(Movie.modelName, 'Create'))
    async createMovie(@Body() movieData: Movie): Promise<Movie> {
        return this.movieService.create(movieData);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @ApiResponse({ status: HttpStatus.OK, type: Movie })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, type: ApiException })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
    @ApiOperation(GetOperationMetadata(Movie.modelName, 'Update'))
    async updateMovie(@Param('id', ParseMongoIdPipe) id: string, @Body() movieData: UpdateMovieVm): Promise<Movie> {
        return this.movieService.update(id, movieData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @ApiResponse({ status: HttpStatus.NO_CONTENT })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, type: ApiException })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
    @ApiOperation(GetOperationMetadata(Movie.modelName, 'Remove'))
    async deleteMovie(@Param('id', ParseMongoIdPipe) id: string): Promise<void> {
        await this.movieService.delete(id);
        return;
    }
}