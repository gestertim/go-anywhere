import { itineraryItemFields } from "@/lib/validation/schemas";
import { z } from "zod";
import { itineraryTypes, type ItineraryType } from "@/types/domain";

const commonItineraryFields = z.object(itineraryItemFields).omit({ type: true });

const withTimeRange = <Schema extends z.ZodTypeAny>(schema: Schema) => schema.superRefine((value, context) => {
	const item = value as { startTime?: string | null; endTime?: string | null };
	if (item.startTime && item.endTime && item.endTime < item.startTime) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ["endTime"], message: "結束時間不可早於開始時間" });
	}
});

export const flightSchema = withTimeRange(commonItineraryFields.extend({ type: z.literal("flight") }));
export const accommodationSchema = withTimeRange(commonItineraryFields.extend({ type: z.literal("accommodation") })).superRefine((value, context) => {
	const item = value as { date?: string | null; endDate?: string | null };
	if (item.date && item.endDate && item.endDate < item.date) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "退房日期不可早於入住日期" });
	}
});
export const transportationSchema = withTimeRange(commonItineraryFields.extend({ type: z.literal("transportation") }));
export const attractionSchema = withTimeRange(commonItineraryFields.extend({ type: z.literal("attraction") }));
export const restaurantSchema = withTimeRange(commonItineraryFields.extend({ type: z.literal("restaurant") }));
export const otherSchema = withTimeRange(commonItineraryFields.extend({ type: z.literal("other") }));

export const itinerarySchemas: Record<ItineraryType, z.ZodTypeAny> = {
	flight: flightSchema,
	accommodation: accommodationSchema,
	transportation: transportationSchema,
	attraction: attractionSchema,
	restaurant: restaurantSchema,
	other: otherSchema,
};

export const bookingSchema = z.object({
	providerName: z.string().trim().max(160).nullable().optional(),
	confirmationCode: z.string().trim().max(160).nullable().optional(),
	referenceUrl: z.string().url("請輸入有效網址").nullable().optional(),
	details: z.string().max(5000).nullable().optional(),
});

export const createItineraryItemSchema = z.union(itineraryTypes.map((type) => itinerarySchemas[type]) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
