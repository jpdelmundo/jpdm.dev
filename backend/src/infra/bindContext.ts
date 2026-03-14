import type { Request } from "express";
import type { AppContext } from "./appContext.js";
import type { ServiceContext } from "./serviceContext.js";

export const bindContext = (app: AppContext) => (req: Request): ServiceContext => ({
    deps: app.deps,
    actor: req.user!
});