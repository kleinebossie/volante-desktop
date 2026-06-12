/**
 * storage.ts — Persistence layer for Volante.
 *
 * Wraps Tauri's filesystem API so the rest of the app never calls filesystem
 * functions directly. All data is stored as JSON files in the Tauri app data
 * directory (e.g., ~/.local/share/com.volante.app/ on Linux).
 *
 * File names used by this app:
 *   - "settings.json"  → UserSettings
 *   - "history.json"   → Session[]
 */

import { readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';

/**
 * The sub-directory within the app data dir where we store our JSON files.
 * Using BaseDirectory.AppData + a filename directly puts files at the root.
 * We store directly at root level for simplicity.
 */

/**
 * Validates a filename to prevent path traversal attacks.
 * Filenames must be simple strings without slashes or parent directory references.
 * Only alphanumeric characters, hyphens, underscores, and exactly one .json extension are allowed.
 *
 * @param filename - e.g., "settings.json"
 * @throws Error if the filename is invalid
 */
function validateFilename(filename: string): void {
  if (!/^[a-zA-Z0-9_-]+\.json$/.test(filename)) {
    throw new Error(`Invalid filename: Path traversal detected "${filename}"`);
  }
}

/**
 * Reads a JSON file from the Tauri app data directory.
 *
 * @param filename - e.g., "settings.json"
 * @returns The parsed JSON object, or null if the file doesn't exist.
 */
export async function readData<T>(filename: string): Promise<T | null> {
  try {
    validateFilename(filename);
    const fileExists = await exists(filename, { baseDir: BaseDirectory.AppData });
    if (!fileExists) {
      return null;
    }
    const raw = await readTextFile(filename, { baseDir: BaseDirectory.AppData });
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[storage] Failed to read "${filename}":`, error);
    return null;
  }
}

/**
 * Writes a JSON object to a file in the Tauri app data directory.
 * Creates the file if it doesn't exist; overwrites if it does.
 *
 * @param filename - e.g., "settings.json"
 * @param data - Any JSON-serializable object.
 */
export async function writeData<T>(filename: string, data: T): Promise<void> {
  try {
    validateFilename(filename);
    // Ensure the app data directory exists before writing.
    // mkdir with recursive:true is safe to call even if the dir already exists.
    await mkdir('', { recursive: true, baseDir: BaseDirectory.AppData });
    const json = JSON.stringify(data, null, 2);
    await writeTextFile(filename, json, { baseDir: BaseDirectory.AppData });
  } catch (error) {
    console.error(`[storage] Failed to write "${filename}":`, error);
  }
}
