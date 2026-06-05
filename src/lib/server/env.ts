import { z } from 'zod';
import * as env from '$env/static/private';

const envSchema = z.object({
	RAPIDAPI_KEY: z.string().min(1, 'RAPIDAPI_KEY is required'),
	RAPIDAPI_HOST: z.string().default('api-football-v1.p.rapidapi.com'),
	TRANSFERMARKT_API_URL: z.string().url('TRANSFERMARKT_API_URL must be a valid URL'),
	TRANSFERMARKT_API_SECRET: z.string().min(1, 'TRANSFERMARKT_API_SECRET is required')
});

const parsedEnv = envSchema.safeParse({
	RAPIDAPI_KEY: env.RAPIDAPI_KEY,
	RAPIDAPI_HOST: env.RAPIDAPI_HOST,
	TRANSFERMARKT_API_URL: env.TRANSFERMARKT_API_URL,
	TRANSFERMARKT_API_SECRET: env.TRANSFERMARKT_API_SECRET
});

if (!parsedEnv.success) {
	console.error('❌ Environment validation failed:', parsedEnv.error.format());
	throw new Error('Invalid environment variables. Please check your .env file.');
}

export const serverEnv = parsedEnv.data;
