import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from '@/shared/index.js';

function isModuleFile(file: string): boolean {
  return (
    (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
  );
}

/**
 * Imports every module file in `directoryUrl` and returns those whose default
 * export passes `guard`. Generic and layer-agnostic, the guard decides what a
 * valid module is; import failures and invalid modules are logged and skipped.
 */
export async function loadModules<T>(
  directoryUrl: URL,
  guard: (value: unknown) => value is T,
): Promise<T[]> {
  const directory = fileURLToPath(directoryUrl);
  const entries = (await readdir(directory, { withFileTypes: true })).filter(
    (entry) => entry.isFile() && isModuleFile(entry.name),
  );

  const loaded: T[] = [];
  for (const entry of entries) {
    const fileUrl = pathToFileURL(join(directory, entry.name));

    let imported: { default?: unknown };
    try {
      imported = (await import(fileUrl.href)) as { default?: unknown };
    } catch (error) {
      logger.error(
        { error, file: entry.name },
        'Failed to import module, skipping',
      );
      continue;
    }

    const candidate = imported.default;
    if (guard(candidate)) {
      loaded.push(candidate);
    } else {
      logger.warn(`${entry.name}: invalid or missing default export, skipping`);
    }
  }

  return loaded;
}
