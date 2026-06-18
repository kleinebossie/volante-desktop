import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readData, writeData } from './storage';
import { exists, readTextFile, writeTextFile, mkdir } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';

vi.mock('@tauri-apps/plugin-fs', () => ({
  exists: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  mkdir: vi.fn(),
}));

describe('storage.ts', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('readData', () => {
    it('blocks path traversal attempts with ..', async () => {
      const result = await readData('../secret.json');

      expect(exists).not.toHaveBeenCalled();
      expect(readTextFile).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[storage] Failed to read "../secret.json":',
        expect.stringContaining('Path traversal detected')
      );
      expect(result).toBeNull();
    });

    it('blocks path traversal attempts with /', async () => {
      const result = await readData('/etc/passwd');

      expect(exists).not.toHaveBeenCalled();
      expect(readTextFile).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[storage] Failed to read "/etc/passwd":',
        expect.stringContaining('Path traversal detected')
      );
      expect(result).toBeNull();
    });

    it('blocks path traversal attempts with \\', async () => {
      const result = await readData('C:\\Windows\\System32\\config\\SAM');

      expect(exists).not.toHaveBeenCalled();
      expect(readTextFile).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[storage] Failed to read "C:\\Windows\\System32\\config\\SAM":',
        expect.stringContaining('Path traversal detected')
      );
      expect(result).toBeNull();
    });

    it('returns parsed JSON when file exists and is readable', async () => {
      vi.mocked(exists).mockResolvedValue(true);
      vi.mocked(readTextFile).mockResolvedValue('{"test":"data"}');

      const result = await readData('test.json');

      expect(exists).toHaveBeenCalledWith('test.json', { baseDir: BaseDirectory.AppData });
      expect(readTextFile).toHaveBeenCalledWith('test.json', { baseDir: BaseDirectory.AppData });
      expect(result).toEqual({ test: 'data' });
    });

    it('returns null when file does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await readData('test.json');

      expect(exists).toHaveBeenCalledWith('test.json', { baseDir: BaseDirectory.AppData });
      expect(readTextFile).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('handles errors gracefully and returns null', async () => {
      const mockError = new Error('Filesystem error');
      vi.mocked(exists).mockRejectedValue(mockError);

      const result = await readData('test.json');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[storage] Failed to read "test.json":', 'Filesystem operation failed');
      expect(result).toBeNull();
    });
  });

  describe('writeData', () => {
    it('blocks path traversal attempts', async () => {
      await writeData('../test.json', { test: 'data' });

      expect(mkdir).not.toHaveBeenCalled();
      expect(writeTextFile).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[storage] Failed to write "../test.json":',
        expect.stringContaining('Path traversal detected')
      );
    });

    it('writes formatted JSON to the file', async () => {
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeTextFile).mockResolvedValue(undefined);

      const testData = { test: 'data' };
      await writeData('test.json', testData);

      expect(mkdir).toHaveBeenCalledWith('', { recursive: true, baseDir: BaseDirectory.AppData });
      expect(writeTextFile).toHaveBeenCalledWith('test.json', JSON.stringify(testData, null, 2), { baseDir: BaseDirectory.AppData });
    });

    it('handles errors gracefully', async () => {
      const mockError = new Error('Filesystem error');
      vi.mocked(mkdir).mockRejectedValue(mockError);

      await writeData('test.json', { test: 'data' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('[storage] Failed to write "test.json":', 'Filesystem operation failed');
    });
  });
});
