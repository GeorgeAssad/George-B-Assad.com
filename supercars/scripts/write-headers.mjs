// Writes public/_headers from src/config/security-headers.ts.
// Uses Node's built-in TypeScript type stripping (Node >= 22.18). The generated file is committed,
// so CI/Workers Builds never needs to run this; a unit test verifies it is in sync.
import { writeFileSync } from "node:fs";
import { renderHeadersFile } from "../src/config/security-headers.ts";

writeFileSync(new URL("../public/_headers", import.meta.url), renderHeadersFile());
console.log("wrote public/_headers");
