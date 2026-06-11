## YYYY-MM-DD - Path Traversal Vulnerability in Storage Utility
**Vulnerability:** Found a path traversal vulnerability in `src/utils/storage.ts` where user-provided filenames could be used to read or write files outside the intended Tauri app data directory using `../` or absolute paths.
**Learning:** Even when wrapping native filesystem APIs, it's crucial to validate that the provided `filename` parameter is truly a simple filename and doesn't contain directory traversal sequences, especially when storing data directly at the root level of the app data directory.
**Prevention:** Implement a strict filename validation function that checks for and rejects slashes (`/`, `\`) and parent directory references (`..`) before passing the filename to underlying filesystem functions.
