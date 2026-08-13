import { z } from "zod";
import { tripSchema } from "@/lib/validation/schemas";

export const createTripSchema = tripSchema;
export const updateTripSchema = z.object({
	id: z.string().uuid(),
	title: z.string().trim().min(1).max(120).optional(),
	destination: z.string().trim().min(1).max(120).optional(),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
