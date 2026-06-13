import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from '@/shared/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Dynamically imports every module file in `directory` and collects the
 * `exportName` export from each, skipping files where it's missing or fails
 * `isValid`.
 */
export async function loadModules<T>(
  directory: string,
  exportName: string,
  isValid: (obj: unknown) => obj is T,
): Promise<T[]> {
  const items: T[] = [];
  const dirPath = join(__dirname, '..', directory);

  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch (error) {
    logger.error({ error }, `Cannot read directory: ${directory}`);
    return items;
  }

  const moduleFiles = files.filter(
    (file) =>
      (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'),
  );

  for (const file of moduleFiles) {
    const fileUrl = pathToFileURL(join(dirPath, file)).href;

    let module: Record<string, unknown>;
    try {
      module = (await import(fileUrl)) as Record<string, unknown>;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error({ err }, `Failed to import file: ${fileUrl}, skipping.`);
      continue;
    }

    const candidate = module[exportName];

    if (!isValid(candidate)) {
      logger.warn(`${file} does not export a valid "${exportName}", skipping.`);
      continue;
    }

    items.push(candidate);
  }

  return items;
}
