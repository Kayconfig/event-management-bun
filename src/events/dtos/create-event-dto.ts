import {
  type infer as zInfer,
  number as zNumber,
  object as zObject,
  string as zString,
} from 'zod';

const minNameLength = 2;
const minTotalSeats = 1;
const maxTotalSeats = 10_000;
export const createEventSchema = zObject({
  name: zString('name must be string')
    .nonempty()
    .min(minNameLength, `name length cannot be less than ${minNameLength}`),
  totalSeats: zNumber('totalSeats must be a number')
    .gte(
      minTotalSeats,
      `totalSeats must be greater than or equal to ${minTotalSeats}`
    )
    .lte(
      maxTotalSeats,
      `totalSeats must be less than or equal to ${maxTotalSeats}`
    ),
});

export type CreateEventDto = zInfer<typeof createEventSchema>;
