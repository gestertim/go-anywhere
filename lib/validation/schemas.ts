import { z } from "zod";
import { itineraryTypes } from "@/types/domain";

export const uuidSchema = z.string().uuid();
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "請輸入有效日期");
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "請輸入有效時間");
export const itineraryTypeSchema = z.enum(itineraryTypes);

const coordinateFields = {
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
};

export const coordinateSchema = z
  .object(coordinateFields)
  .refine(
    ({ latitude, longitude }) => (latitude == null && longitude == null) || (latitude != null && longitude != null),
    "緯度與經度必須同時提供",
  );

export const tripSchema = z
  .object({
    title: z.string().trim().min(1, "請輸入旅程標題").max(120),
    destination: z.string().trim().min(1, "請輸入目的地").max(120),
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    path: ["endDate"],
    message: "結束日期不可早於開始日期",
  });

export const placeSchema = z.object({
  name: z.string().trim().max(160).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  ...coordinateFields,
}).refine(
  ({ latitude, longitude }) => (latitude == null && longitude == null) || (latitude != null && longitude != null),
  "緯度與經度必須同時提供",
);

export const itineraryItemFields = {
  type: itineraryTypeSchema,
  title: z.string().trim().max(160).nullable().optional(),
  date: dateSchema.nullable().optional(),
  endDate: dateSchema.nullable().optional(),
  startTime: timeSchema.nullable().optional(),
  endTime: timeSchema.nullable().optional(),
  place: placeSchema.nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
};

export const itineraryItemSchema = z
  .object(itineraryItemFields)
  .refine(({ startTime, endTime }) => !startTime || !endTime || startTime <= endTime, {
    path: ["endTime"],
    message: "結束時間不可早於開始時間",
  })
  .refine(({ date, endDate }) => !endDate || !date || date <= endDate, {
    path: ["endDate"],
    message: "退房日期不可早於入住日期",
  });
