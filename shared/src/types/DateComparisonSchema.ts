import z from 'zod';

export const DateComparisonSchema = z.union([
    z.object({ eq: z.coerce.date() }).strict(),
    z.object({ lt: z.coerce.date() }).strict(),
    z.object({ lte: z.coerce.date() }).strict(),
    z.object({ gt: z.coerce.date() }).strict(),
    z.object({ gte: z.coerce.date() }).strict(),
    z.object({ between: z.tuple([z.coerce.date(), z.coerce.date()]) }).strict(),
    z.object({ isNull: z.literal(true) }).strict(),
    z.object({ isNotNull: z.literal(true) }).strict(),
]);