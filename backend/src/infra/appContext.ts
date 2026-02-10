import type { Db } from "@/types/Db.js";
import type { Deps } from "@/types/Deps.js";
import { makeDeps } from "./makeDeps.js";

export type AppContext = {
  deps: Deps;
};

export const createAppContext = (db: Db): AppContext => ({
  deps: makeDeps(db)
});