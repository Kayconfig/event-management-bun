import {
  coerce as zCoerce,
  type infer as zInfer,
  object as zObject,
  string as zString,
} from 'zod';
import { ErrSecretNotFound } from './errors/err-secret-not-found';

const minJwtSecretLength = 16;
const secretsSchema = zObject({
  DATABASE_URL: zString().nonempty(),
  PORT: zCoerce.number().nonnegative(),
  JWT_SECRET: zString()
    .nonempty()
    .min(
      minJwtSecretLength,
      `JWT_SECRET cannot be less than ${minJwtSecretLength}`
    ),
  ACCESS_TOKEN_EXPIRES: zString().nonempty(),
  REDIS_HOST: zString().nonempty(),
  REDIS_PORT: zCoerce.number().gt(0),
  NODE_ENV: zString().default('development'),
});

const env = secretsSchema.parse(process.env);
type Secrets = zInfer<typeof secretsSchema>;
type SecretsKey = keyof Secrets;

export function getSecretOrThrow<T extends SecretsKey>(key: T): Secrets[T] {
  const value = env[key];
  if (!value) {
    throw ErrSecretNotFound.create(`environment variable: ${key} not found`);
  }
  return value;
}
