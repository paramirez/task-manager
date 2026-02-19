import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
      continue;
    }
    if (!fullPath.endsWith('.ts')) continue;
    if (fullPath.endsWith('.spec.ts')) continue;
    files.push(fullPath);
  }
  return files;
}

function assertNoForbiddenImports(
  files: string[],
  forbiddenPatterns: RegExp[],
  layerName: string,
) {
  const violations: string[] = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(content)) {
        violations.push(`${relative(process.cwd(), file)} matches ${pattern}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `${layerName} has forbidden dependencies:\n${violations.join('\n')}`,
    );
  }
  expect(violations).toEqual([]);
}

describe('Layer boundaries', () => {
  it('module domain must not depend on application/infrastructure/frameworks', () => {
    const files = collectTsFiles(join(process.cwd(), 'src/modules'));
    const domainFiles = files.filter((file) => file.includes('/domain/'));
    assertNoForbiddenImports(
      domainFiles,
      [
        /from ['"]@\/modules\/[^/]+\/application\//,
        /from ['"]@\/modules\/[^/]+\/infrastructure\//,
        /from ['"]@nestjs\//,
        /from ['"]express['"]/,
        /from ['"]supertest['"]/,
      ],
      'domain',
    );
  });

  it('module application must not depend on infrastructure/frameworks', () => {
    const files = collectTsFiles(join(process.cwd(), 'src/modules'));
    const applicationFiles = files.filter((file) =>
      file.includes('/application/'),
    );
    assertNoForbiddenImports(
      applicationFiles,
      [
        /from ['"]@\/modules\/[^/]+\/infrastructure\//,
        /from ['"]@nestjs\//,
        /from ['"]express['"]/,
        /from ['"]supertest['"]/,
      ],
      'application',
    );
  });
});
