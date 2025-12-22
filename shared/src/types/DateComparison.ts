export type DateComparison =
    | { eq: Date }
    | { lt: Date }
    | { lte: Date }
    | { gt: Date }
    | { gte: Date }
    | { between: [Date, Date] }
    | { isNull: true }
    | { isNotNull: true };