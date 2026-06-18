## 2025-06-12 - Path Traversal Vulnerability in Storage Utility
**Vulnerability:** Found a path traversal vulnerability in `src/utils/storage.ts` where user-provided filenames could be used to read or write files outside the intended Tauri app data directory using `../` or absolute paths.
**Learning:** Even when wrapping native filesystem APIs and checking for `..`, `/`, and `\`, using an allowlist approach (stricting checking using regex) is necessary because blocklists can often be bypassed using encoding, null bytes, or OS-specific quirks.
**Prevention:** Implement a strict filename validation function that checks that the filename strictly matches an allowlist regex (e.g. `/^[a-zA-Z0-9_-]+\.json$/`) before passing the filename to underlying filesystem functions.

## 2025-06-12 - Strict CSP `script-src` to Prevent XSS
**Vulnerability:** The Content Security Policy (CSP) lacked a `script-src` directive, falling back to `default-src 'self'`. While `default-src 'self'` provides baseline protection, explicitly setting `script-src 'self'` ensures strict control over script execution sources and adds defense-in-depth against XSS.
**Learning:** Always define `script-src` explicitly in CSP configurations, even if `default-src` seems restrictive enough.
**Prevention:** In Tauri configurations (`tauri.conf.json`) and standard web environments, explicitly list `script-src` within the CSP.

## 2025-06-14 - Throttle DOM Event Handlers for Client-Side DoS Prevention
**Vulnerability:** High-frequency DOM events (like `mousemove`) were triggering penalty detector countdown resets directly without throttling.
**Learning:** Attaching complex logic or even simple timeout resets to unthrottled, high-frequency DOM events can lead to high CPU/battery drain and potentially client-side Denial of Service (DoS).
**Prevention:** Throttle DOM event handlers, especially for continuous events like `mousemove` and `scroll`, to execute at most every 500ms or appropriate interval.

## 2025-03-08 - [Information Leak] Prevent OS Path Leakage in Storage Logs
**Vulnerability:** The application was passing raw `Error` objects from Tauri's `@tauri-apps/plugin-fs` directly to `console.error` inside `src/utils/storage.ts`. In desktop applications, native filesystem error objects typically contain absolute local paths (e.g., `/Users/johndoe/.local/share/com.volante.app/settings.json`), inadvertently exposing the user's OS username and filesystem structure to the console or potential log collectors.
**Learning:** Native API errors often contain sensitive environmental data that is not safe to dump to the console, especially if error reporting tools or log files are present.
**Prevention:** Always extract and log only generic messages or safe, known application-level validation errors from native exceptions. Fail securely without leaking system internals to prevent PII exposure.
