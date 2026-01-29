import type { Db } from "@/types/Db";
import type { Deps } from "@/types/Deps";
import { makeDeps } from "./makeDeps";

export type AppContext = {
  deps: Deps;
};

export const createAppContext = (db: Db): AppContext => ({
  deps: makeDeps(db)
});