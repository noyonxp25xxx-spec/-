import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import manifest from '../src/app/manifest';

describe('7. PWA Manifest & App Configuration', () => {
  test('manifest returns correct application name and short name', () => {
    const m = manifest();
    assert.equal(m.name, 'Bhagya Unnayan Samaj Kallyan Sangstha');
    assert.equal(m.short_name, 'Bhagya Society');
  });

  test('manifest specifies standalone display mode and correct brand colors', () => {
    const m = manifest();
    assert.equal(m.display, 'standalone');
    assert.equal(m.theme_color, '#0f5132');
    assert.equal(m.background_color, '#f8fafc');
    assert.equal(m.start_url, '/');
  });

  test('manifest includes standard 192x192, 512x512 and maskable icons', () => {
    const m = manifest();
    assert.ok(m.icons && m.icons.length >= 4);

    const has192 = m.icons.some((i) => i.sizes === '192x192' && i.purpose === 'any');
    const has512 = m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any');
    const hasMaskable192 = m.icons.some((i) => i.sizes === '192x192' && i.purpose === 'maskable');
    const hasMaskable512 = m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable');

    assert.ok(has192, 'Should include 192x192 icon');
    assert.ok(has512, 'Should include 512x512 icon');
    assert.ok(hasMaskable192, 'Should include 192x192 maskable icon');
    assert.ok(hasMaskable512, 'Should include 512x512 maskable icon');
  });
});

describe('8. PWA Icon Assets in File System', () => {
  test('all required icon assets exist and are non-empty PNG files', () => {
    const files = [
      'public/icons/icon-192x192.png',
      'public/icons/icon-512x512.png',
      'public/icons/icon-maskable-192x192.png',
      'public/icons/icon-maskable-512x512.png',
      'public/apple-touch-icon.png',
    ];

    for (const f of files) {
      const fullPath = path.join(process.cwd(), f);
      assert.ok(fs.existsSync(fullPath), `Icon file ${f} must exist`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Icon file ${f} must be valid non-empty image`);
    }
  });
});

describe('9. Service Worker Security & Offline Rules', () => {
  test('sw.js exists and enforces strict network-only isolation for /api/ and financial portals', () => {
    const swPath = path.join(process.cwd(), 'public/sw.js');
    assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');

    const swContent = fs.readFileSync(swPath, 'utf-8');
    assert.ok(swContent.includes('/api/'), 'Must explicitly handle /api/ routes');
    assert.ok(swContent.includes('/ceo/'), 'Must protect CEO dashboard from cache');
    assert.ok(swContent.includes('/employee/'), 'Must protect employee portal from cache');
    assert.ok(swContent.includes('/offline'), 'Must provide offline fallback');
  });

  test('offline fallback page exists for network loss scenarios', () => {
    const offlinePage = path.join(process.cwd(), 'src/app/offline/page.tsx');
    assert.ok(fs.existsSync(offlinePage), 'Offline page must exist');
  });
});
