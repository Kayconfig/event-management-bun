import { uuid, type ZodSafeParseResult } from 'zod';
export async function validateUUID(
  input: unknown
): Promise<ZodSafeParseResult<string>> {
  return await uuid().safeParseAsync(input);
}
