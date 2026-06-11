## 2025-06-12 - Path Traversal Vulnerability in Storage Utility
**Vulnerability:** Found a path traversal vulnerability in `src/utils/storage.ts` where user-provided filenames could be used to read or write files outside the intended Tauri app data directory using `../` or absolute paths.
**Learning:** Even when wrapping native filesystem APIs and checking for `..`, `/`, and `\`, using an allowlist approach (stricting checking using regex) is necessary because blocklists can often be bypassed using encoding, null bytes, or OS-specific quirks.
**Prevention:** Implement a strict filename validation function that checks that the filename strictly matches an allowlist regex (e.g. `/^[a-zA-Z0-9_-]+\.json$/`) before passing the filename to underlying filesystem functions.
