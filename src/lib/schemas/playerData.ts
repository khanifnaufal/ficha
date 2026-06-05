import { z } from 'zod';

export const MergedBirthSchema = z.object({
	date: z.string().nullable(),
	place: z.string().nullable(),
	country: z.string().nullable()
});

export const MergedTeamSchema = z.object({
	id: z.number(),
	name: z.string(),
	logo: z.string().nullable()
});

export const MergedLeagueSchema = z.object({
	id: z.number().nullable(),
	name: z.string(),
	country: z.string().nullable(),
	logo: z.string().nullable(),
	season: z.number().nullable()
});

export const MergedGamesSchema = z.object({
	appearences: z.number(),
	minutes: z.number(),
	rating: z.string().nullable(),
	position: z.string().nullable(),
	captain: z.boolean()
});

export const MergedGoalsSchema = z.object({
	total: z.number(),
	assists: z.number()
});

export const MergedCardsSchema = z.object({
	yellow: z.number(),
	yellowred: z.number(),
	red: z.number()
});

export const MergedStatisticsSchema = z.object({
	team: MergedTeamSchema,
	league: MergedLeagueSchema,
	games: MergedGamesSchema,
	goals: MergedGoalsSchema,
	cards: MergedCardsSchema
});

export const MergedMarketValueHistoryItemSchema = z.object({
	date: z.string(),
	value: z.number().or(z.string()),
	clubName: z.string().nullable()
});

export const MergedMarketValueSchema = z.object({
	current: z.string().nullable(),
	highest: z.string().nullable(),
	highestDate: z.string().nullable(),
	history: z.array(MergedMarketValueHistoryItemSchema)
});

export const MergedTransferItemSchema = z.object({
	date: z.string().nullable(),
	season: z.string().nullable(),
	fromClub: z.string().nullable(),
	toClub: z.string().nullable(),
	fee: z.string().nullable(),
	marketValue: z.string().nullable()
});

export const PlayerDataSchema = z.object({
	id: z.number(), // Primary reference ID from API-Football
	name: z.string(),
	firstname: z.string().nullable(),
	lastname: z.string().nullable(),
	age: z.number().nullable(),
	birth: MergedBirthSchema.nullable(),
	nationality: z.string().nullable(),
	height: z.string().nullable(),
	weight: z.string().nullable(),
	injured: z.boolean(),
	photo: z.string().nullable(),
	currentTeam: MergedTeamSchema.nullable(),
	currentLeague: MergedLeagueSchema.nullable(),
	statistics: z.array(MergedStatisticsSchema),
	marketValue: MergedMarketValueSchema.nullable(),
	transfers: z.array(MergedTransferItemSchema)
});

export type MergedBirth = z.infer<typeof MergedBirthSchema>;
export type MergedTeam = z.infer<typeof MergedTeamSchema>;
export type MergedLeague = z.infer<typeof MergedLeagueSchema>;
export type MergedGames = z.infer<typeof MergedGamesSchema>;
export type MergedGoals = z.infer<typeof MergedGoalsSchema>;
export type MergedCards = z.infer<typeof MergedCardsSchema>;
export type MergedStatistics = z.infer<typeof MergedStatisticsSchema>;
export type MergedMarketValueHistoryItem = z.infer<typeof MergedMarketValueHistoryItemSchema>;
export type MergedMarketValue = z.infer<typeof MergedMarketValueSchema>;
export type MergedTransferItem = z.infer<typeof MergedTransferItemSchema>;
export type PlayerData = z.infer<typeof PlayerDataSchema>;
