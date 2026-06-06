import { z } from 'zod';
import * as env from '$env/static/private';

const envSchema = z.object({
	API_FOOTBALL_KEY: z.string().min(1, 'API_FOOTBALL_KEY is required'),
	API_FOOTBALL_URL: z.string().min(1, 'API_FOOTBALL_URL is required'),
	TRANSFERMARKT_KEY: z.string().min(1, 'TRANSFERMARKT_KEY is required'),
	TRANSFERMARKT_URL: z.string().url('TRANSFERMARKT_URL must be a valid URL')
});

const parsedEnv = envSchema.safeParse({
	API_FOOTBALL_KEY: env.API_FOOTBALL_KEY,
	API_FOOTBALL_URL: env.API_FOOTBALL_URL,
	TRANSFERMARKT_KEY: env.TRANSFERMARKT_KEY,
	TRANSFERMARKT_URL: env.TRANSFERMARKT_URL
});

if (!parsedEnv.success) {
	console.error('❌ Environment validation failed:', parsedEnv.error.format());
	throw new Error('Invalid environment variables. Please check your .env file.');
}

export const serverEnv = parsedEnv.data;
