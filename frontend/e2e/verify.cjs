/**
 * Labyro verification harness — the machine checker.
 *
 * Drives the built site in a real browser against a deterministic mock API
 * and enforces the Labyro Standard (see LABYRO_STANDARD.md at repo root):
 *   - every route renders (an uncaught page error = failure)
 *   - expected content is present (no silent dead ends)
 *   - per-route document titles are set
 *   - zero CRITICAL axe accessibility violations (serious ones are logged)
 *   - cross-role integration: a message sent by the professor is visible
 *     to the student
 *
 * Usage: `npm run verify:e2e` after `vite build` with
 * VITE_API_URL=http://localhost:5998. Set CHROMIUM_BIN to use a system
 * chromium instead of Playwright's download.
 */
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const MOCK_PORT = 5998;
const PREVIEW_PORT = 4199;
const BASE = `http://localhost:${PREVIEW_PORT}`;
// Production origin the app stamps into per-route <link rel="canonical"> (must
// match SITE_URL in src/config.ts). Rendered at localhost, the canonical still
// points at the real production URL for the route — that is what we assert.
const SITE_URL = 'https://labyro.com';
const AXE_PATH = require.resolve('axe-core/axe.min.js');

const ROUTES = [
  // Public (canonical: assert the per-route <link rel="canonical"> — see below)
  { path: '/', expect: ['Find research that matches'], canonical: true },
  { path: '/projects', expect: ['Behavioral Economics RA'], title: true, canonical: true },
  { path: '/projects/proj-1', expect: ["What we're looking for", 'Verified university email'], title: true, canonical: true },
  { path: '/professors', expect: ['Ada Prof'], title: true, canonical: true },
  { path: '/professors/prof-1', expect: ['Accepting students', 'Verified university email'], title: true, canonical: true },
  { path: '/login', expect: ['Welcome back'], title: true, canonical: true },
  { path: '/signup', expect: ['Create your account'], title: true, canonical: true },
  { path: '/about', expect: ['About Labyro'], title: true, canonical: true },
  { path: '/privacy', expect: ['Privacy'], title: true, canonical: true },
  { path: '/terms', expect: ['Terms'], title: true, canonical: true },
  // Professor
  { path: '/professor/dashboard', token: 'prof-token', expect: ['Your lab, at a glance'] },
  { path: '/professor/projects', token: 'prof-token', expect: ['Behavioral Economics RA'] },
  { path: '/professor/applications', token: 'prof-token', expect: ['Milan Markovits'] },
  {
    path: '/professor/applications/app-1', token: 'prof-token',
    expect: ['Private conversation with Milan Markovits', 'AI fit analysis', 'Update Status'],
    interact: async (page) => {
      await page.fill('textarea[aria-label*="Message"]', 'Which econometrics courses have you taken?');
      await page.click('button[aria-label="Send message"]');
      await page.waitForTimeout(800);
      const ok = await page.evaluate(() => document.body.innerText.includes('econometrics courses'));
      if (!ok) throw new Error('sent message did not render');
    },
  },
  { path: '/professor/projects/new', token: 'prof-token', expect: ['Post Research Opportunity'] },
  // Student (message sent above must be visible: cross-role integration)
  { path: '/student/dashboard', token: 'student-token', expect: ['Recent Applications'] },
  { path: '/student/profile', token: 'student-token', expect: ['Edit Profile'] },
  { path: '/student/applications', token: 'student-token', expect: ['My Applications'] },
  {
    path: '/student/applications/app-1', token: 'student-token',
    expect: ['Your cover letter', 'econometrics courses'],
  },
  { path: '/projects/proj-1?as=student', token: 'student-token', expect: ['Apply now'] },
];

function waitFor(url, tries = 40) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      require('http').get(url, () => resolve()).on('error', () => {
        if (n <= 0) return reject(new Error(`not reachable: ${url}`));
        setTimeout(() => attempt(n - 1), 500);
      });
    };
    attempt(tries);
  });
}

(async () => {
  const children = [];
  const cleanup = () => children.forEach((c) => { try { c.kill(); } catch { /* already dead */ } });
  process.on('exit', cleanup);

  children.push(spawn('node', [path.join(__dirname, 'mock-api.cjs')], { stdio: 'ignore', env: { ...process.env, MOCK_PORT: String(MOCK_PORT) } }));
  children.push(spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
    stdio: 'ignore', cwd: path.join(__dirname, '..'), env: process.env,
  }));
  await waitFor(`http://localhost:${MOCK_PORT}/api/config`);
  await waitFor(BASE);

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_BIN || undefined,
    headless: true,
  });

  const failures = [];
  const warnings = [];

  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    // Offline-deterministic: only the preview server and the mock API exist.
    // External requests (fonts, analytics) would just add latency or flakes.
    await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());

    if (route.token) {
      const token = route.token;
      await page.addInitScript((t) => {
        localStorage.setItem('accessToken', t);
        localStorage.setItem('refreshToken', t);
      }, token);
    }

    try {
      await page.goto(BASE + route.path, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(700);

      if (route.interact) await route.interact(page);

      const body = await page.evaluate(() => document.body.innerText);
      for (const text of route.expect) {
        if (!body.includes(text)) failures.push(`${route.path}: missing expected text "${text}"`);
      }

      if (route.title) {
        const title = await page.title();
        if (!title.includes('Labyro')) failures.push(`${route.path}: bad document title "${title}"`);
      }

      // Per-route canonical: usePageMeta must stamp <link rel="canonical"> with
      // THIS route's production URL (SITE_URL + pathname), never the homepage.
      // This is what catches the old index.html bug where every route claimed
      // https://labyro.com/ as its canonical. og:url must NOT come back statically.
      if (route.canonical) {
        const expected = SITE_URL + route.path.split('?')[0];
        const found = await page.evaluate(() => {
          const link = document.head.querySelector('link[rel="canonical"]');
          const og = document.head.querySelector('meta[property="og:url"]');
          const links = document.head.querySelectorAll('link[rel="canonical"]').length;
          return { href: link ? link.href : null, ogUrl: og ? og.getAttribute('content') : null, count: links };
        });
        if (found.href !== expected) {
          failures.push(`${route.path}: canonical "${found.href}" !== expected "${expected}"`);
        }
        if (found.count !== 1) {
          failures.push(`${route.path}: expected exactly 1 canonical link, found ${found.count}`);
        }
        if (found.ogUrl) {
          failures.push(`${route.path}: static og:url reintroduced ("${found.ogUrl}") — per-route OG needs prerender, not a hardcoded tag`);
        }
      }

      if (pageErrors.length) failures.push(`${route.path}: page error(s): ${pageErrors.join(' | ')}`);

      // Accessibility: fail on critical, log serious (Standard §10)
      await page.addScriptTag({ path: AXE_PATH });
      const axe = await page.evaluate(() => window.axe.run(document, { resultTypes: ['violations'] }));
      for (const v of axe.violations) {
        const targets = v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ');
        const line = `${route.path}: axe ${v.impact}: ${v.id} (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'}: ${targets})`;
        if (v.impact === 'critical') failures.push(line);
        else if (v.impact === 'serious') warnings.push(line);
      }

      console.log(`✓ ${route.path}`);
    } catch (err) {
      failures.push(`${route.path}: ${err.message}`);
      console.log(`✗ ${route.path}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  cleanup();

  if (warnings.length) {
    console.log('\n⚠ serious accessibility issues (not failing yet — burn these down):');
    warnings.forEach((w) => console.log('  ' + w));
  }
  if (failures.length) {
    console.error('\nFAILURES:');
    failures.forEach((f) => console.error('  ' + f));
    process.exit(1);
  }
  console.log(`\nAll ${ROUTES.length} route checks passed.`);
  process.exit(0);
})();
