import type { User } from '../generated/User';
import type { UserRole } from '../generated/UserRole';

export default interface UserWithRoles extends User {
    roles: UserRole[];
}