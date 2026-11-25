/* Sizzle Station — the entrypoint (Node 22, standard library only).
 *
 * It hands the game in: it copies game/ and screenshots/ from this
 * repository into the output directory and writes dossier.json there with
 * buildDossier from vendor/makefun-game.ts. Outside the grader,
 * MAKEFUN_OUTPUT_DIR stands in for /output. The run is deterministic:
 * the same repository always writes the same bytes.
 */
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-game.ts";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const repoRoot = new URL(".", import.meta.url).pathname;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, "game"), join(outDir, "game"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outDir, "dossier.json"), dossier);
console.log(`wrote ${join(outDir, "dossier.json")} (${dossier.length} bytes)`);
