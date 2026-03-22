import type { Actor } from '@shared/types/Actor.js';
import type { UserRole } from '@shared/types/UserRole.js';

export const hasRole = (actor: Actor, role: UserRole): boolean =>
    actor.type === 'user' && actor.roles.includes(role);

export const hasAnyRole = (actor: Actor, roles: UserRole[]): boolean =>
    actor.type === 'user' && actor.roles.some(r => roles.includes(r));

export const isSystem = (actor: Actor): boolean =>
    actor.type === 'system';

export const isAuthenticatedUser = (actor: Actor): actor is { type: 'user'; id: string; username: string; email: string | null; roles: UserRole[] } =>
    actor.type === 'user';

export const isOwner = (actor: Actor, itemUserId: string): boolean =>
    actor.type === 'user' && actor.id === itemUserId;

export const canModify = (actor: Actor, itemUserId: string): boolean =>
    isSystem(actor) || isOwner(actor, itemUserId) || hasRole(actor, 'admin');

// export const canModerate = (actor: Actor): boolean =>
//     isSystem(actor) || hasAnyRole(actor, ['admin']);