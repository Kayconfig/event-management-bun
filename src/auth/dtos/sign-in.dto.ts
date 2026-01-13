import z from 'zod';
export const signInDtoSchema = z.object({
  username: z
    .string('username is required')
    .min(2, 'username cannot be less than 2 characters')
    .max(255, 'username cannot exceed 255 characters'),
  password: z
    .string('password is required')
    .min(8, 'password cannot be less than 8 characters')
    .max(255, 'password cannot exceed 255 characters'),
});

export type SignInDto = z.infer<typeof signInDtoSchema>;
