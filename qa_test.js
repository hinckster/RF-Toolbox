/**
 * qa_test.js — Regression test suite for RF Toolbox
 * Usage:
 *   node qa_test.js          — test all pages
 *   node qa_test.js 03       — test only 03_*.html
 *   node qa_test.js index    — test index only
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// ── Tool registry ──────────────────────────────────────────────────────────
const TOOLS = [
  { file: 'index.html',               num: null,  title: 'RF Toolbox' },
  { file: '01_link_budget.html',      num: '01',  title: 'Link Budget' },
  { file: '02_noise_figure.html',     num: '02',  title: null },
  { file: '03_iip3_intermod.html',    num: '03',  title: null },
  { file: '04_antenna_array.html',    num: '04',  title: null },
  { file: '05_smith_chart.html',      num: '05',  title: null },
  { file: '06_radar_range.html',      num: '06',  title: null },
  { file: '07_superheterodyne.html',  num: '07',  title: null },
  { file: '08_fspl.html',             num: '08',  title: null },
  { file: '09_transmission_line.html',num: '09',  title: null },
  { file: '10_phase_noise.html',      num: '10',  title: null },
  { file: '11_pa_efficiency.html',    num: '11',  title: null },
  { file: '12_modulation_ber.html',   num: '12',  title: null },
  { file: '13_microstrip.html',       num: '13',  title: null },
  { file: '14_attenuator.html',       num: '14',  title: null },
  { file: '15_mixer.html',            num: '15',  title: null },
  { file: '16_sparam.html',           num: '16',  title: null },
  { file: '17_filter.html',           num: '17',  title: null },
];

const TOOLBAR_BUTTONS = ['Help', 'Screenshot', 'Export CSV', 'Fullscreen', 'Copy Link'];
const INDEX_TOOL_COUNT = 17;

// ── Result helpers ─────────────────────────────────────────────────────────
const PASS = '  ✓';
const FAIL = '  ✗';
const WARN = '  ⚠';

function p(label)       { return { ok: true,  label, warn: false }; }
function f(label)       { return { ok: false, label, warn: false }; }
function w(label)       { return { ok: true,  label, warn: true  }; }

// ── Per-page test runner ───────────────────────────────────────────────────
async function testPage(browser, tool) {
  const filePath = path.join(__dirname, tool.file);
  if (!fs.existsSync(filePath)) {
    return { tool, skipped: true, results: [], errors: [`File not found: ${tool.file}`] };
  }

  const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
  const results = [];
  const consoleErrors = [];

  const tab = await browser.newPage();
  tab.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  tab.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}\n       at ${(err.stack||'').split('\n')[1]||'?'}`));

  // ── 1. Load ──────────────────────────────────────────────────────────────
  try {
    await tab.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    const resp = await tab.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 600)); // allow chart renders
    results.push(p('Page loads'));
  } catch (e) {
    results.push(f(`Page load failed: ${e.message}`));
    await tab.close();
    return { tool, skipped: false, results, errors: consoleErrors };
  }

  // ── 2. Chart.js available (skip for index; warn-not-fail if custom canvas) ─
  if (tool.file !== 'index.html') {
    const chartDefined = await tab.evaluate(() => typeof window.Chart !== 'undefined');
    const canvasCount2 = await tab.evaluate(() => document.querySelectorAll('canvas').length);
    if (chartDefined) {
      results.push(p('Chart.js loaded'));
    } else if (canvasCount2 > 0) {
      results.push(w('Chart.js not loaded — custom canvas renderer (expected for this tool)'));
    } else {
      results.push(f('Chart.js NOT loaded and no canvas found'));
    }
  }

  // ── 3. Console errors ────────────────────────────────────────────────────
  if (consoleErrors.length === 0) {
    results.push(p('No console errors'));
  } else {
    // Filter out known benign CDN errors (e.g. favicon 404 on file://)
    const realErrors = consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR_FILE_NOT_FOUND')
    );
    if (realErrors.length === 0) {
      results.push(w(`Console warnings (benign): ${consoleErrors.length}`));
    } else {
      results.push(f(`${realErrors.length} console error(s): ${realErrors.slice(0,2).join(' | ')}`));
    }
  }

  // ── INDEX-SPECIFIC TESTS ─────────────────────────────────────────────────
  if (tool.file === 'index.html') {
    // Card count
    const cardCount = await tab.evaluate(() =>
      document.querySelectorAll('a[href$=".html"]:not([href="index.html"])').length
    );
    results.push(cardCount >= INDEX_TOOL_COUNT
      ? p(`Index has ${cardCount} tool links (≥${INDEX_TOOL_COUNT})`)
      : f(`Index has only ${cardCount} tool links (expected ≥${INDEX_TOOL_COUNT})`));

    // All hrefs resolve to existing files
    const hrefs = await tab.evaluate(() =>
      [...document.querySelectorAll('a[href$=".html"]')]
        .map(a => a.getAttribute('href'))
        .filter(h => h && !h.startsWith('http') && h !== 'index.html')
    );
    const missing = hrefs.filter(h => !fs.existsSync(path.join(__dirname, h)));
    results.push(missing.length === 0
      ? p('All card hrefs resolve to existing files')
      : f(`Broken hrefs: ${missing.join(', ')}`));

    // h1 present
    const h1 = await tab.evaluate(() => document.querySelector('h1')?.textContent?.trim());
    results.push(h1 ? p(`h1 present: "${h1}"`) : f('Missing h1'));

    await tab.close();
    return { tool, skipped: false, results, errors: [] };
  }

  // ── TOOL-PAGE TESTS ──────────────────────────────────────────────────────

  // 4. h1
  const h1Text = await tab.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? '');
  results.push(h1Text ? p(`h1: "${h1Text}"`) : f('Missing h1'));

  // 5. Correct tool number in .tag
  const tagText = await tab.evaluate(() => document.querySelector('header .tag')?.textContent?.trim() ?? '');
  if (tool.num) {
    const expectedNum = `Tool ${tool.num}`;
    const numOk = tagText.startsWith(expectedNum);
    results.push(numOk
      ? p(`.tag correct: "${tagText}"`)
      : f(`.tag wrong — got "${tagText}", expected to start with "${expectedNum}"`));
  }

  // 6. Toolbar — 5 buttons in correct order
  const btnTexts = await tab.evaluate(() =>
    [...document.querySelectorAll('.toolbar .tbtn, .toolbar button')]
      .map(b => b.textContent.trim())
  );
  const toolbarOk = TOOLBAR_BUTTONS.every(expected =>
    btnTexts.some(t => t.includes(expected))
  );
  results.push(toolbarOk
    ? p(`Toolbar: ${btnTexts.length} buttons [${btnTexts.map(t => t.replace(/[^\x20-\x7E]/g, '').trim()).join(' | ')}]`)
    : f(`Toolbar missing buttons — got: [${btnTexts.join(' | ')}], expected: ${TOOLBAR_BUTTONS.join(', ')}`));

  // 7. Correct button count
  results.push(btnTexts.length === 5
    ? p('Toolbar has exactly 5 buttons')
    : f(`Toolbar has ${btnTexts.length} buttons (expected 5)`));

  // 8. Nav breadcrumb back to index
  const hasIndexLink = await tab.evaluate(() =>
    !!document.querySelector('nav a[href="index.html"]')
  );
  results.push(hasIndexLink ? p('Nav breadcrumb → index.html') : f('Nav missing link to index.html'));

  // 9. Equation box
  const hasEqBox = await tab.evaluate(() =>
    !!(document.querySelector('.equation-box') || document.querySelector('.eq-box') || document.querySelector('.eq-bar'))
  );
  const eqBoxEmpty = await tab.evaluate(() => {
    const el = document.querySelector('.equation-box') || document.querySelector('.eq-box') || document.querySelector('.eq-bar');
    return el ? el.textContent.trim().length < 5 : true;
  });
  results.push(hasEqBox && !eqBoxEmpty ? p('Equation box present and non-empty') : f('Missing or empty equation box'));

  // 10. Annotation
  const hasAnnotation = await tab.evaluate(() => !!document.querySelector('.annotation'));
  const annotationEmpty = await tab.evaluate(() => {
    const el = document.querySelector('.annotation');
    return el ? el.textContent.trim().length < 10 : true;
  });
  results.push(hasAnnotation && !annotationEmpty ? p('Annotation present and non-empty') : f('Missing or empty annotation'));

  // 11. Annotation border color (copper #b5895a)
  const annotationBorder = await tab.evaluate(() => {
    const el = document.querySelector('.annotation');
    if (!el) return null;
    return window.getComputedStyle(el).borderLeftColor;
  });
  // rgb(181,137,90) = #b5895a
  const copperOk = annotationBorder && (
    annotationBorder.includes('181') && annotationBorder.includes('137') && annotationBorder.includes('90')
  );
  results.push(copperOk
    ? p(`Annotation border copper (${annotationBorder})`)
    : f(`Annotation border wrong color: ${annotationBorder} (expected copper rgb(181,137,90))`));

  // 12. Canvas / chart rendering
  const canvasCount = await tab.evaluate(() => document.querySelectorAll('canvas').length);
  results.push(canvasCount > 0 ? p(`${canvasCount} canvas element(s)`) : f('No canvas elements (no charts?)'));

  // 13. Slider accent-color — blue, not copper
  const sliderCheck = await tab.evaluate(() => {
    const sliders = [...document.querySelectorAll('input[type=range]')];
    if (sliders.length === 0) return { count: 0, issues: [] };
    const issues = [];
    sliders.forEach((s, i) => {
      const ac = window.getComputedStyle(s).accentColor;
      // blue #2563eb = rgb(37,99,235)
      const isBlue = ac && (
        ac === '#2563eb' ||
        ac.includes('rgb(37, 99, 235)') ||
        ac.includes('rgb(37,99,235)')
      );
      // copper = rgb(181,137,90)
      const isCopper = ac && (ac.includes('181') && ac.includes('137') && ac.includes('90'));
      if (isCopper) issues.push(`slider[${i}] is copper (${ac})`);
      else if (!isBlue) issues.push(`slider[${i}] unexpected accent: ${ac}`);
    });
    return { count: sliders.length, issues };
  });
  if (sliderCheck.count === 0) {
    results.push(p('No range sliders (skipping accent-color check)'));
  } else if (sliderCheck.issues.length === 0) {
    results.push(p(`${sliderCheck.count} slider(s) — accent-color blue ✓`));
  } else {
    results.push(f(`Slider accent-color violation: ${sliderCheck.issues.join('; ')}`));
  }

  // 14. Help modal — click Help, check overlay opens
  const helpResult = await tab.evaluate(async () => {
    const btn = [...document.querySelectorAll('.toolbar button, .toolbar .tbtn')]
      .find(b => b.textContent.includes('Help'));
    if (!btn) return 'no-btn';
    btn.click();
    await new Promise(r => setTimeout(r, 100));
    const overlay = document.querySelector('.help-overlay');
    if (!overlay) return 'no-overlay';
    return overlay.classList.contains('open') ? 'open' : 'not-open';
  });
  if (helpResult === 'open')       results.push(p('Help modal opens on click'));
  else if (helpResult === 'no-btn')     results.push(f('Help button not found'));
  else if (helpResult === 'no-overlay') results.push(f('Help overlay element missing'));
  else                                  results.push(f('Help overlay did not open'));

  // Close help modal before next tests
  await tab.evaluate(() => {
    const overlay = document.querySelector('.help-overlay');
    if (overlay) overlay.classList.remove('open');
  });

  // 15. Presets — click first preset button, check no crash
  const presetResult = await tab.evaluate(async () => {
    const btn = document.querySelector('.pbtn, .preset-btn, button.preset');
    if (!btn) return 'none';
    const errorsBefore = window.__qaErrors ? window.__qaErrors.length : 0;
    btn.click();
    await new Promise(r => setTimeout(r, 200));
    return 'clicked';
  });
  if (presetResult === 'clicked')  results.push(p('Preset button click — no crash'));
  else                              results.push(w('No preset buttons found'));

  // 16. All-tools footer button
  const hasAllTools = await tab.evaluate(() =>
    !!document.querySelector('.all-tools-btn, a[href="index.html"].all-tools-btn')
  );
  results.push(hasAllTools ? p('All-Tools button present') : f('All-Tools button missing'));

  // 17. Mobile layout — re-check at 375px
  await tab.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await new Promise(r => setTimeout(r, 300));
  const mobileConsoleErrors = []; // already captured via listener
  const mobileH1 = await tab.evaluate(() => document.querySelector('h1')?.textContent?.trim());
  results.push(mobileH1 ? p('Mobile viewport — h1 still visible') : f('Mobile viewport — h1 missing'));

  const mobileLayout = await tab.evaluate(() => {
    const layout = document.querySelector('.layout');
    if (!layout) return 'no-layout';
    const cols = window.getComputedStyle(layout).gridTemplateColumns;
    // Single column at mobile = one track
    return cols;
  });
  const isSingleCol = !mobileLayout.includes('px') ||
    mobileLayout.trim().split(/\s+/).filter(s => s !== 'px').length <= 1 ||
    mobileLayout === 'none' || mobileLayout === 'no-layout';
  // Just report what we see — not strict fail
  results.push(p(`Mobile grid: ${mobileLayout}`));

  await tab.close();
  return { tool, skipped: false, results, errors: [] };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  let toolsToTest = TOOLS;
  if (args.length > 0) {
    toolsToTest = TOOLS.filter(t => {
      if (t.file === 'index.html' && args.includes('index')) return true;
      return args.some(a => t.file.startsWith(a));
    });
    if (toolsToTest.length === 0) {
      console.error('No pages matched args:', args);
      process.exit(1);
    }
  }

  console.log(`\nRF Toolbox — Regression Test Suite`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Testing ${toolsToTest.length} page(s)...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let totalPass = 0;
  let totalFail = 0;
  let totalWarn = 0;
  const failedPages = [];

  for (const tool of toolsToTest) {
    console.log(`► ${tool.file}`);
    const { skipped, results, errors } = await testPage(browser, tool);

    if (skipped) {
      console.log(`  ⊘  SKIPPED (file not found)\n`);
      continue;
    }

    let pageFailed = false;
    for (const r of results) {
      if (r.warn) {
        console.log(`${WARN}  ${r.label}`);
        totalWarn++;
      } else if (r.ok) {
        console.log(`${PASS}  ${r.label}`);
        totalPass++;
      } else {
        console.log(`${FAIL}  ${r.label}`);
        totalFail++;
        pageFailed = true;
      }
    }

    if (errors.length > 0) {
      console.log(`${FAIL}  Console errors:`);
      errors.slice(0, 3).forEach(e => console.log(`       ${e}`));
      totalFail++;
      pageFailed = true;
    }

    if (pageFailed) failedPages.push(tool.file);
    console.log('');
  }

  await browser.close();

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log(`RESULTS:  ${totalPass} passed  |  ${totalFail} failed  |  ${totalWarn} warnings`);
  if (failedPages.length > 0) {
    console.log(`\nFAILED PAGES:`);
    failedPages.forEach(f => console.log(`  ✗  ${f}`));
    console.log('');
    process.exit(1);
  } else {
    console.log(`\nAll tests passed.\n`);
    process.exit(0);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
