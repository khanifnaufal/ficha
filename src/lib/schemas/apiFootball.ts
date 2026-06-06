import { z } from 'zod';

export const ApiFootballBirthSchema = z.object({
	date: z.string().nullable().optional(),
	place: z.string().nullable().optional(),
	country: z.string().nullable().optional()
});

export const ApiFootballPlayerSchema = z.object({
	id: z.number(),
	name: z.string(),
	firstname: z.string().nullable().optional(),
	lastname: z.string().nullable().optional(),
	age: z.number().nullable().optional(),
	birth: ApiFootballBirthSchema.nullable().optional(),
	nationality: z.string().nullable().optional(),
	height: z.string().nullable().optional(),
	weight: z.string().nullable().optional(),
	injured: z.boolean().nullable().optional().default(false),
	photo: z.string().url().nullable().optional(),
	position: z.string().nullable().optional()
});


export const ApiFootballTeamSchema = z.object({
	id: z.number(),
	name: z.string(),
	logo: z.string().url().nullable().optional()
});

export const ApiFootballLeagueSchema = z.object({
	id: z.number().nullable().optional(),
	name: z.string(),
	country: z.string().nullable().optional(),
	logo: z.string().url().nullable().optional(),
	season: z.number().nullable().optional()
});

export const ApiFootballGamesSchema = z.object({
	appearences: z.number().nullable().optional().default(0),
	lineups: z.number().nullable().optional().default(0),
	minutes: z.number().nullable().optional().default(0),
	number: z.number().nullable().optional(),
	position: z.string().nullable().optional(),
	rating: z.string().nullable().optional(),
	captain: z.boolean().nullable().optional().default(false)
});

export const ApiFootballSubstitutesSchema = z.object({
	in: z.number().nullable().optional().default(0),
	out: z.number().nullable().optional().default(0),
	bench: z.number().nullable().optional().default(0)
});

export const ApiFootballShotsSchema = z.object({
	total: z.number().nullable().optional().default(0),
	on: z.number().nullable().optional().default(0)
});

export const ApiFootballGoalsSchema = z.object({
	total: z.number().nullable().optional().default(0),
	assists: z.number().nullable().optional().default(0),
	saves: z.number().nullable().optional().default(0),
	conceded: z.number().nullable().optional().default(0)
});

export const ApiFootballPassesSchema = z.object({
	total: z.number().nullable().optional().default(0),
	key: z.number().nullable().optional().default(0),
	accuracy: z.number().nullable().optional().default(0)
});

export const ApiFootballTacklesSchema = z.object({
	total: z.number().nullable().optional().default(0),
	blocks: z.number().nullable().optional().default(0),
	interceptions: z.number().nullable().optional().default(0)
});

export const ApiFootballDuelsSchema = z.object({
	total: z.number().nullable().optional().default(0),
	won: z.number().nullable().optional().default(0)
});

export const ApiFootballDribblesSchema = z.object({
	attempts: z.number().nullable().optional().default(0),
	success: z.number().nullable().optional().default(0),
	past: z.number().nullable().optional().default(0)
});

export const ApiFootballFoulsSchema = z.object({
	drawn: z.number().nullable().optional().default(0),
	committed: z.number().nullable().optional().default(0)
});

export const ApiFootballCardsSchema = z.object({
	yellow: z.number().nullable().optional().default(0),
	yellowred: z.number().nullable().optional().default(0),
	red: z.number().nullable().optional().default(0)
});

export const ApiFootballPenaltySchema = z.object({
	won: z.number().nullable().optional().default(0),
	commited: z.number().nullable().optional().default(0),
	scored: z.number().nullable().optional().default(0),
	missed: z.number().nullable().optional().default(0),
	saved: z.number().nullable().optional().default(0)
});

export const ApiFootballStatisticsSchema = z.object({
	team: ApiFootballTeamSchema,
	league: ApiFootballLeagueSchema,
	games: ApiFootballGamesSchema.nullable().optional(),
	substitutes: ApiFootballSubstitutesSchema.nullable().optional(),
	shots: ApiFootballShotsSchema.nullable().optional(),
	goals: ApiFootballGoalsSchema.nullable().optional(),
	passes: ApiFootballPassesSchema.nullable().optional(),
	tackles: ApiFootballTacklesSchema.nullable().optional(),
	duels: ApiFootballDuelsSchema.nullable().optional(),
	dribbles: ApiFootballDribblesSchema.nullable().optional(),
	fouls: ApiFootballFoulsSchema.nullable().optional(),
	cards: ApiFootballCardsSchema.nullable().optional(),
	penalty: ApiFootballPenaltySchema.nullable().optional()
});

export const ApiFootballPlayerItemSchema = z.object({
	player: ApiFootballPlayerSchema,
	statistics: z.array(ApiFootballStatisticsSchema).default([])
});

export const ApiFootballPlayerResponseSchema = z.object({
	get: z.string().optional(),
	parameters: z.record(z.string(), z.any()).optional(),
	errors: z.array(z.any()).or(z.record(z.string(), z.any())).optional(),
	results: z.number().optional(),
	paging: z
		.object({
			current: z.number(),
			total: z.number()
		})
		.optional(),
	response: z.array(ApiFootballPlayerItemSchema)
});

export type ApiFootballPlayerBirth = z.infer<typeof ApiFootballBirthSchema>;
export type ApiFootballPlayer = z.infer<typeof ApiFootballPlayerSchema>;
export type ApiFootballTeam = z.infer<typeof ApiFootballTeamSchema>;
export type ApiFootballLeague = z.infer<typeof ApiFootballLeagueSchema>;
export type ApiFootballStatistics = z.infer<typeof ApiFootballStatisticsSchema>;
export type ApiFootballPlayerItem = z.infer<typeof ApiFootballPlayerItemSchema>;
export type ApiFootballPlayerResponse = z.infer<typeof ApiFootballPlayerResponseSchema>;
