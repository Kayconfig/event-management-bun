import { coerce, object as zObject, type infer as zInfer } from 'zod';
import { DEFAULT_PAGINATION_LIMIT } from '../constants/pagination';

export const offSetPaginationSchemaDto = zObject({
  skip: coerce.number('skip must be a valid number').optional().default(0),
  limit: coerce
    .number('limit must be a valid number')
    .optional()
    .default(DEFAULT_PAGINATION_LIMIT),
});

export type OffsetPaginationDto = zInfer<typeof offSetPaginationSchemaDto>;
