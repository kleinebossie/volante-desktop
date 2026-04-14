/**
 * Run with: npx ts-node scripts/extract-track-paths.ts
 *
 * Prerequisites:
 *   git clone https://github.com/julesr0y/f1-circuits-svg.git /tmp/f1-circuits-svg
 *
 * This script:
 * 1. Reads each SVG file from /tmp/f1-circuits-svg/circuits/minimal/white-outline/
 * 2. Extracts the `d` attribute from the first <path> element
 * 3. Outputs src/data/tracks/trackPaths.ts with a Record<layoutId, pathD>
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';

const SVG_DIR = '/tmp/f1-circuits-svg/circuits/minimal/white-outline';
const OUTPUT = 'src/data/tracks/trackPaths.ts';

const files = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
const paths: Record<string, string> = {};

for (const file of files) {
  const content = readFileSync(`${SVG_DIR}/${file}`, 'utf-8');
  const match = content.match(/d="([^"]+)"/);
  if (match) {
    const layoutId = file.replace('.svg', '');
    paths[layoutId] = match[1];
  }
}

const output = `// Auto-generated from julesr0y/f1-circuits-svg (CC-BY-4.0)\n// Source: circuits/minimal/white-outline/\n// Do not edit manually — re-run scripts/extract-track-paths.ts\n\nexport const TRACK_PATHS: Record<string, string> = ${JSON.stringify(paths, null, 2)};\n`;

writeFileSync(OUTPUT, output);
console.log(`Extracted ${Object.keys(paths).length} track paths to ${OUTPUT}`);
