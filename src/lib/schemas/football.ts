import { z } from 'zod';

// ─── Country / Nationality ────────────────────────────────────────────────────
export const FootballCountrySchema = z.object({
	name: z.string().nullable().optional(),
	alpha2: z.string().nullable().optional(),
	alpha3: z.string().nullable().optional()
}).nullable().optional();

// ─── Team (used inside player data & statistics) ─────────────────────────────
export const FootballTeamSchema = z.object({
	id: z.number().or(z.string()).nullable().optional(),
	name: z.string().nullable().optional(),
	slug: z.string().nullable().optional(),
	shortName: z.string().nullable().optional(),
	gender: z.string().nullable().optional(),
	logo: z.string().url().nullable().optional(),
	userCount: z.number().nullable().optional(),
	national: z.boolean().nullable().optional()
}).nullable().optional();

// ─── Tournament / League (used in statistics) ────────────────────────────────
export const FootballUniqueTournamentSchema = z.object({
	id: z.number().or(z.string()).nullable().optional(),
	name: z.string().nullable().optional(),
	slug: z.string().nullable().optional(),
	category: z
		.object({
			id: z.number().or(z.string()).nullable().optional(),
			name: z.string().nullable().optional(),
			slug: z.string().nullable().optional(),
			flag: z.string().nullable().optional(),
			alpha2: z.string().nullable().optional()
		})
		.nullable()
		.optional()
}).nullable().optional();

export const FootballSeasonSchema = z.object({
	id: z.number().or(z.string()).nullable().optional(),
	name: z.string().nullable().optional(),
	year: z.string().or(z.number()).nullable().optional()
}).nullable().optional();

// ─── Player (from /football-get-player-detail) ──────────────────────────────────────────
export const FootballPlayerSchema = z.object({
	id: z.number().or(z.string()).nullable().optional(),
	name: z.string().nullable().optional(),
	slug: z.string().nullable().optional(),
	shortName: z.string().nullable().optional(),
	position: z.string().nullable().optional(),
	shirtNumber: z.number().or(z.string()).nullable().optional(),
	dateOfBirthTimestamp: z.number().nullable().optional(),
	birthDate: z.string().nullable().optional(),
	height: z.number().or(z.string()).nullable().optional(),
	weight: z.number().or(z.string()).nullable().optional(),
	preferredFoot: z.string().nullable().optional(),
	country: FootballCountrySchema,
	team: FootballTeamSchema,
	nationalTeam: FootballTeamSchema,
	marketValue: z.number().or(z.string()).nullable().optional(),
	injured: z.boolean().nullable().optional()
}).nullable().optional();

// ─── Player Data Response (/football-get-player-detail) ──────────────────────────────────
export const FootballPlayerDataResponseSchema = z.object({
	data: FootballPlayerSchema,
	status: z.string().nullable().optional(),
	message: z.string().nullable().optional()
});

// ─── Statistics ──────────────────────────────────────────────────────────────
export const FootballPlayerStatisticsSchema = z.object({
	rating: z.number().nullable().optional(),
	appearances: z.number().nullable().optional(),
	minutesPlayed: z.number().nullable().optional(),
	goals: z.number().nullable().optional(),
	assists: z.number().nullable().optional(),
	yellowCards: z.number().nullable().optional(),
	yellowRedCards: z.number().nullable().optional(),
	redCards: z.number().nullable().optional(),
	position: z.string().nullable().optional(),
	saves: z.number().nullable().optional(),
	cleanSheets: z.number().nullable().optional(),
	goalsConceded: z.number().nullable().optional()
}).nullable().optional();

export const FootballPlayerStatisticsResultSchema = z.object({
	data: z
		.object({
			player: FootballPlayerSchema,
			team: FootballTeamSchema,
			uniqueTournament: FootballUniqueTournamentSchema,
			season: FootballSeasonSchema,
			statistics: FootballPlayerStatisticsSchema
		})
		.nullable()
		.optional()
});

// ─── Statistics Seasons Response ──────────────────────────────────────────────
export const FootballStatisticsSeasonsItemSchema = z.object({
	uniqueTournament: FootballUniqueTournamentSchema,
	seasons: z.array(FootballSeasonSchema)
});

export const FootballStatisticsSeasonsResponseSchema = z.object({
	data: z
		.object({
			uniqueTournamentSeasons: z.array(FootballStatisticsSeasonsItemSchema).optional()
		})
		.nullable()
		.optional()
});

// ─── Search Response (/football-players-search) ─────────────────────────────────────────────
export const FootballSearchResultItemSchema = z.object({
	entity: z.object({
		id: z.number().or(z.string()),
		name: z.string(),
		slug: z.string().nullable().optional(),
		shortName: z.string().nullable().optional(),
		position: z.string().nullable().optional(),
		team: FootballTeamSchema,
		country: FootballCountrySchema,
		dateOfBirthTimestamp: z.number().nullable().optional()
	}).nullable().optional(),
	score: z.number().nullable().optional(),
	type: z.string().nullable().optional()
});

export const FootballSearchResponseSchema = z.object({
	results: z.array(FootballSearchResultItemSchema).optional()
});

// ─── TypeScript types ─────────────────────────────────────────────────────────
export type FootballCountry = z.infer<typeof FootballCountrySchema>;
export type FootballTeam = z.infer<typeof FootballTeamSchema>;
export type FootballPlayer = z.infer<typeof FootballPlayerSchema>;
export type FootballPlayerDataResponse = z.infer<typeof FootballPlayerDataResponseSchema>;
export type FootballPlayerStatistics = z.infer<typeof FootballPlayerStatisticsSchema>;
export type FootballPlayerStatisticsResult = z.infer<typeof FootballPlayerStatisticsResultSchema>;
export type FootballStatisticsSeasonsItem = z.infer<typeof FootballStatisticsSeasonsItemSchema>;
export type FootballStatisticsSeasonsResponse = z.infer<
	typeof FootballStatisticsSeasonsResponseSchema
>;
export type FootballSearchResultItem = z.infer<typeof FootballSearchResultItemSchema>;
export type FootballSearchResponse = z.infer<typeof FootballSearchResponseSchema>;
