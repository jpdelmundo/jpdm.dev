import type { Deps } from "@/types/Deps.js";
import type { Actor } from "@shared/types/Actor.js";

export interface ServiceContext {
    deps: Deps;
    actor: Actor;
}