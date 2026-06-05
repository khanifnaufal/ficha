import { z } from 'zod';

export const TransfermarktMarketValueHistoryItemSchema = z.object({
	date: z.string(),
	value: z.number().or(z.string()),
	clubName: z.string().nullable().optional()
});

export const TransfermarktMarketValueSchema = z.object({
	current: z.string().or(z.number()).nullable().optional(),
	highest: z.string().or(z.number()).nullable().optional(),
	highestDate: z.string().nullable().optional(),
	history: z.array(TransfermarktMarketValueHistoryItemSchema).nullable().optional().default([])
});

export const TransfermarktTransferItemSchema = z.object({
	date: z.string().nullable().optional(),
	season: z.string().nullable().optional(),
	from: z.string().nullable().optional(),
	to: z.string().nullable().optional(),
	fee: z.string().nullable().optional(),
	marketValue: z.string().or(z.number()).nullable().optional()
});

export const TransfermarktPlayerResponseSchema = z.object({
	id: z.string().or(z.number()).nullable().optional(),
	name: z.string().nullable().optional(),
	marketValue: TransfermarktMarketValueSchema.nullable().optional(),
	transfers: z.array(TransfermarktTransferItemSchema).nullable().optional().default([])
});

export type TransfermarktMarketValueHistoryItem = z.infer<
	typeof TransfermarktMarketValueHistoryItemSchema
>;
export type TransfermarktMarketValue = z.infer<typeof TransfermarktMarketValueSchema>;
export type TransfermarktTransferItem = z.infer<typeof TransfermarktTransferItemSchema>;
export type TransfermarktPlayerResponse = z.infer<typeof TransfermarktPlayerResponseSchema>;
