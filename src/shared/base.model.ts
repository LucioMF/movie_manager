import { ApiPropertyOptional } from '@nestjs/swagger';
import { prop, modelOptions } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        toJSON: {
            virtuals: true,
            getters: true,
        },
        toObject: {
            virtuals: true,
            getters: true,
        },
    },
})

export class BaseModel<T> {
    @prop({ default: Date.now() })
    createdAt?: Date;

    @prop({ default: Date.now() })
    updatedAt?: Date;

    _id?: string;
}

export class BaseModelVM {

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    createdAt?: Date;

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    updatedAt?: Date;

    @ApiPropertyOptional()
    _id?: string;
}
