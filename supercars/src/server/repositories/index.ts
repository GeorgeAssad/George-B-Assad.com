import { localRepositories } from "./local";
import type { Repositories } from "./types";

export type * from "./types";

/** Single switch point: return a database-backed `Repositories` here later. */
export function getRepositories(): Repositories {
  return localRepositories;
}
