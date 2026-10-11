import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface VercelHeaderItem {
  key: string;
  value: string;
}

interface VercelHeaderRule {
  source: string;
  headers: VercelHeaderItem[];
}

interface VercelConfig {
  buildCommand?: string;
  outputDirectory?: string;
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  headers?: VercelHeaderRule[];
}

const ROOT_DIR = path.resolve(__dirname, '../../..');

function collectFilesRecursively(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Edge Security Headers & Bundle Secret Isolation (S5-T3)', () => {
  it('parses vercel.json cleanly and configures required security headers and CSP directives', () => {
    const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json');
    expect(fs.existsSync(vercelConfigPath)).toBe(true);

    const rawConfig = fs.readFileSync(vercelConfigPath, 'utf-8');
    const parsedConfig = JSON.parse(rawConfig) as VercelConfig;

    expect(parsedConfig.outputDirectory).toBe('dist');
    expect(parsedConfig.cleanUrls).toBe(true);
    expect(parsedConfig.trailingSlash).toBe(false);
    expect(Array.isArray(parsedConfig.headers)).toBe(true);

    const globalRule = parsedConfig.headers?.find((rule) => rule.source === '/(.*)');
    expect(globalRule).toBeDefined();

    const headerMap = new Map<string, string>(
      (globalRule?.headers ?? []).map((item) => [item.key, item.value]),
    );

    const csp = headerMap.get('Content-Security-Policy') ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("connect-src 'self' https://*.supabase.co");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain('upgrade-insecure-requests');

    expect(headerMap.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headerMap.get('X-Frame-Options')).toBe('DENY');
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    );

    const assetsRule = parsedConfig.headers?.find((rule) => rule.source === '/assets/(.*)');
    expect(assetsRule).toBeDefined();
    const assetsHeaderMap = new Map<string, string>(
      (assetsRule?.headers ?? []).map((item) => [item.key, item.value]),
    );
    expect(assetsHeaderMap.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('verifies no service_role keys, sb_secret_ tokens, or server-only modules leak into src or dist bundles', () => {
    const srcDir = path.join(ROOT_DIR, 'src');
    const allSrcFiles = collectFilesRecursively(srcDir);

    const nonTestSrcFiles = allSrcFiles.filter(
      (filePath) => !filePath.endsWith('.test.ts') && !filePath.endsWith('.test.tsx'),
    );

    const secretTokenPattern = /sb_secret_[A-Za-z0-9_-]{4,}/i;
    const serviceRoleJwtPayloadPattern = /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+/;

    for (const filePath of nonTestSrcFiles) {
      const normalizedRel = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      const content = fs.readFileSync(filePath, 'utf-8');

      // No file may contain an actual sb_secret_<token> value
      expect(content, `Secret token found in ${normalizedRel}`).not.toMatch(secretTokenPattern);

      // No file may contain a hardcoded JWT token
      expect(content, `Hardcoded JWT found in ${normalizedRel}`).not.toMatch(
        serviceRoleJwtPayloadPattern,
      );

      // Only env.ts, server.ts, and client.ts JSDoc may reference SUPABASE_SERVICE_ROLE_KEY or sb_secret_ guard strings
      if (
        normalizedRel !== 'src/lib/supabase/env.ts' &&
        normalizedRel !== 'src/lib/supabase/server.ts'
      ) {
        expect(content, `Unexpected service role reference in ${normalizedRel}`).not.toContain(
          'SUPABASE_SERVICE_ROLE_KEY',
        );
        if (normalizedRel !== 'src/lib/supabase/client.ts') {
          expect(content, `Unexpected sb_secret_ reference in ${normalizedRel}`).not.toContain(
            'sb_secret_',
          );
        }
      }
    }

    // If production bundle exists in dist/assets, verify server.ts and secret values are absent
    const distAssetsDir = path.join(ROOT_DIR, 'dist', 'assets');
    const distJsFiles = collectFilesRecursively(distAssetsDir).filter((filePath) =>
      filePath.endsWith('.js'),
    );

    for (const bundleFile of distJsFiles) {
      const normalizedRel = path.relative(ROOT_DIR, bundleFile).replace(/\\/g, '/');
      const bundleContent = fs.readFileSync(bundleFile, 'utf-8');

      expect(bundleContent, `Secret token leaked in ${normalizedRel}`).not.toMatch(
        secretTokenPattern,
      );
      expect(
        bundleContent,
        `server.ts module leaked into browser bundle ${normalizedRel}`,
      ).not.toContain('src/lib/supabase/server.ts cannot be executed in a browser environment');
    }
  });

  it('verifies .gitignore excludes .env, .env.local, and .env.*.local', () => {
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignoreLines = fs
      .readFileSync(gitignorePath, 'utf-8')
      .split(/\r?\n/)
      .map((line) => line.trim());

    expect(gitignoreLines).toContain('.env');
    expect(gitignoreLines).toContain('.env.local');
    expect(gitignoreLines).toContain('.env.*.local');
  });
});
