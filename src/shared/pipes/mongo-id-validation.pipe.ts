import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string | undefined> {
    transform(value: string): string | undefined {
        if (!value) return undefined;
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException('The id must be a valid MongoDB ObjectId');
        }
        return value;
    }
}
