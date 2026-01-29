import type { UserIdentity } from "@shared/types/UserIdentity";

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends UserIdentity { };
        interface Request {
            user?: User;
        }
    }
}