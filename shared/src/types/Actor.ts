import { PayloadData } from "./Jwt";

export type Actor =
    | { type: 'user'; } & Pick<PayloadData, 'id' | 'roles'>
    | { type: 'system' };