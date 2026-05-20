export const OrderDirection = {
    ASC: 'asc',
    DESC: 'desc'
} as const;
export type OrderDirection = (typeof OrderDirection)[keyof typeof OrderDirection];