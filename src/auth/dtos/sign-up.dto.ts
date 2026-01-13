import z from 'zod';
export const signUpDtoSchema = z.object({
  username: z.string().min(2).max(255),
  password: z.string().min(8).max(255),
});

export type SignUpDto = z.infer<typeof signUpDtoSchema>;
